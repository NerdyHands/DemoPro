import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-55 [&_svg]:size-4',
  {
    variants: {
      variant: {
        default:
          'border-2 border-primary bg-primary text-white shadow-md hover:bg-primary-dark hover:border-primary-dark hover:-translate-y-px',
        outline:
          'border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white hover:-translate-y-px',
        ghost: 'text-foreground hover:text-primary hover:bg-surface',
        destructive: 'border-2 border-danger bg-danger text-white hover:opacity-90'
      },
      size: {
        default: 'h-10 min-h-10 px-4 py-2',
        sm: 'h-9 min-h-9 px-3',
        lg: 'h-11 min-h-11 px-6',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}
