"use client"

import React, { forwardRef } from 'react';
import { Root } from '@radix-ui/react-label';
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");

const Label = forwardRef((props, ref) => {
  const { className, ...rest } = props;
  return (
    <Root
      ref={ref}
      className={cn(labelVariants(), className)}
      {...rest}
    />
  );
});
Label.displayName = Root.displayName;

export {Label};
