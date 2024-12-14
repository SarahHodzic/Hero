import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

interface popUp {
    action: string
    open: boolean
    handleClose: () => void
    handleLogin: () => void
}

export default function LoginDialogForum({action, open, handleClose, handleLogin}: popUp){
    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>
                You have to be logged in!
            </DialogTitle>
            <DialogContent>
                If you want to {action} you have to be logged in. Do you wish to login right now?
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
                <Button onClick={handleLogin}>Login</Button>
            </DialogActions>
        </Dialog>
    );
}