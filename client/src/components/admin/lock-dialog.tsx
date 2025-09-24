// Temporary file with lock functionality
// Add lock/unlock dialog
<Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Lock KYC Application</DialogTitle>
      <DialogDescription>
        Please provide a reason for locking this application.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <Textarea
        placeholder="Enter lock reason..."
        value={lockNote}
        onChange={(e) => setLockNote(e.target.value)}
        rows={4}
      />
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setShowLockDialog(false)}>
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={() => selectedApp && lockApplication(selectedApp.id)}
          disabled={!lockNote.trim()}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          Lock Application
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>