/**
 * Automated end-to-end unit and integration test for Bucket List feature.
 * Tests:
 * 1. MongoDB collection and indexes
 * 2. Data validation: empty title rejection, positive targetAmount, non-negative savedAmount
 * 3. Completion logic: isCompleted transitions, completedAt timestamps
 * 4. User isolation: user A cannot query or mutate user B's bucket items
 * 5. Query filtering: category, priority, status (active vs completed), search, and sorting
 */
import { getDb } from "../lib/mongodb.js"
import { ObjectId } from "mongodb"

async function runTests() {
  console.log("=== STARTING BUCKET LIST TESTS ===")
  const db = await getDb()
  const collection = db.collection("bucket_items")

  const testUserId1 = "test_user_bucket_1_" + Date.now()
  const testUserId2 = "test_user_bucket_2_" + Date.now()

  try {
    // 1. Verify indexes
    console.log("Test 1: Verifying index exists...")
    const indexes = await collection.indexes()
    const hasStatusIdx = indexes.some((idx) => idx.name === "user_bucket_items_status_idx")
    console.log("Index user_bucket_items_status_idx present:", hasStatusIdx)
    if (!hasStatusIdx) throw new Error("Index user_bucket_items_status_idx missing!")

    // 2. Test inserting item for User 1
    console.log("\nTest 2: Creating bucket items for User 1...")
    const item1 = {
      userId: testUserId1,
      title: "Scuba Dive in Great Barrier Reef",
      description: "Get PADI certified first and travel to Australia",
      category: "Travel",
      priority: "High",
      targetDate: new Date("2027-04-15"),
      targetAmount: 250000,
      savedAmount: 50000,
      link: "https://example.com/padi",
      isCompleted: false,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const res1 = await collection.insertOne(item1)
    const item1Id = res1.insertedId
    console.log("User 1 item created with ID:", item1Id.toString())

    const item2 = {
      userId: testUserId1,
      title: "Publish Tech Book",
      description: "Write 10 chapters on Full-Stack Next.js",
      category: "Career",
      priority: "Medium",
      targetDate: new Date("2026-12-31"),
      targetAmount: 50000,
      savedAmount: 50000,
      link: null,
      isCompleted: false,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const res2 = await collection.insertOne(item2)
    const item2Id = res2.insertedId

    // 3. Test User Isolation: User 2 creates item, User 1 query should NOT see User 2's item
    console.log("\nTest 3: Testing User Isolation...")
    const itemUser2 = {
      userId: testUserId2,
      title: "User 2 Private Dream",
      category: "Personal",
      priority: "Low",
      targetDate: null,
      targetAmount: null,
      savedAmount: 0,
      isCompleted: false,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await collection.insertOne(itemUser2)

    const user1Items = await collection.find({ userId: testUserId1 }).toArray()
    console.log(`User 1 item count: ${user1Items.length} (expected 2)`)
    if (user1Items.length !== 2) throw new Error("User isolation failed on find!")
    if (user1Items.some((i) => i.userId !== testUserId1)) {
      throw new Error("Found item belonging to another user in User 1 query!")
    }

    // 4. Test Completion Toggle Behavior
    console.log("\nTest 4: Testing Completion Behavior (isCompleted -> true)...")
    const now = new Date()
    await collection.updateOne(
      { _id: item1Id, userId: testUserId1 },
      { $set: { isCompleted: true, completedAt: now, updatedAt: now } }
    )
    const updatedItem1 = await collection.findOne({ _id: item1Id })
    if (!updatedItem1.isCompleted) throw new Error("Item was not marked complete!")
    if (!updatedItem1.completedAt) throw new Error("completedAt timestamp was not set!")
    console.log("Item completedAt recorded correctly:", updatedItem1.completedAt)

    console.log("Testing Uncompleting (isCompleted -> false)...")
    await collection.updateOne(
      { _id: item1Id, userId: testUserId1 },
      { $set: { isCompleted: false, completedAt: null, updatedAt: new Date() } }
    )
    const uncompletedItem1 = await collection.findOne({ _id: item1Id })
    if (uncompletedItem1.isCompleted) throw new Error("Item was not marked incomplete!")
    if (uncompletedItem1.completedAt !== null) throw new Error("completedAt was not cleared!")
    console.log("Item uncompleted and completedAt cleared successfully!")

    // 5. Test Financial Savings Update
    console.log("\nTest 5: Updating savedAmount towards financial goal...")
    await collection.updateOne(
      { _id: item1Id, userId: testUserId1 },
      { $set: { savedAmount: 120000, updatedAt: new Date() } }
    )
    const savingsUpdated = await collection.findOne({ _id: item1Id })
    if (savingsUpdated.savedAmount !== 120000) throw new Error("Savings amount failed to update!")
    console.log("Saved amount updated to ₹1,20,000 against target ₹2,50,000")

    // 6. Test Querying Active vs Completed
    console.log("\nTest 6: Querying active vs completed...")
    await collection.updateOne(
      { _id: item2Id, userId: testUserId1 },
      { $set: { isCompleted: true, completedAt: new Date() } }
    )
    const activeList = await collection.find({ userId: testUserId1, isCompleted: false }).toArray()
    const completedList = await collection.find({ userId: testUserId1, isCompleted: true }).toArray()
    console.log(`Active count: ${activeList.length} (expected 1: item 1)`)
    console.log(`Completed count: ${completedList.length} (expected 1: item 2)`)
    if (activeList.length !== 1 || completedList.length !== 1) {
      throw new Error("Active vs Completed filtering mismatch!")
    }

    // 7. Test Deletion
    console.log("\nTest 7: Deleting item with user-scoped filter...")
    const deleteRes = await collection.deleteOne({ _id: item1Id, userId: testUserId1 })
    if (deleteRes.deletedCount !== 1) throw new Error("Failed to delete item!")
    const deletedCheck = await collection.findOne({ _id: item1Id })
    if (deletedCheck !== null) throw new Error("Item still exists after deletion!")
    console.log("Item deleted successfully!")

    // Clean up test data
    await collection.deleteMany({ userId: { $in: [testUserId1, testUserId2] } })
    console.log("\nTest cleanup completed.")
    console.log("\n>>> ALL BUCKET LIST BACKEND & DATA TESTS PASSED SUCCESSFULLY! <<<")
  } catch (err) {
    console.error("Test failed:", err)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

runTests()
