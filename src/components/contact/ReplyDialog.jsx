import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';

export default function ReplyDialog({
  open,
  message,
  replyText,
  onChange,
  onSubmit,
  onClose,
  loading,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>پاسخ به {message?.name}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="متن پاسخ"
            name="reply"
            value={replyText}
            onChange={onChange}
            margin="normal"
            required
            multiline
            minRows={4}
            placeholder="متن پاسخ خود را اینجا بنویسید..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          لغو
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {loading ? 'در حال ارسال...' : 'ارسال پاسخ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

