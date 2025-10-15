"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message?: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="text-center space-y-3">
          <DialogTitle className="text-lg font-semibold leading-tight">
            {title}
          </DialogTitle>
          {message && (
            <DialogDescription className="text-gray-600 text-base">
              {message}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <DialogFooter className="gap-3 mt-6">
          {cancelText && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              {cancelText}
            </Button>
          )}
          <Button 
            onClick={onConfirm}
            className={cancelText ? "flex-1 bg-red-600 hover:bg-red-700" : "w-full"}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmationDialog