import { Dialog, DialogTitle, DialogContent, Box, Typography } from '@mui/material';

export default function ViewMessageDialog({ open, message, onClose }) {
  if (!message) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>جزئیات پیام</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            نام
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {message.name}
          </Typography>

          <Typography variant="subtitle2" color="text.secondary">
            ایمیل
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <a href={`mailto:${message.email}`}>{message.email}</a>
          </Typography>

          {message.phone && (
            <>
              <Typography variant="subtitle2" color="text.secondary">
                شماره تماس
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <a href={`tel:${message.phone}`}>{message.phone}</a>
              </Typography>
            </>
          )}

          {message.subject && (
            <>
              <Typography variant="subtitle2" color="text.secondary">
                موضوع
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {message.subject}
              </Typography>
            </>
          )}

          <Typography variant="subtitle2" color="text.secondary">
            متن پیام
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 2,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1,
              whiteSpace: 'pre-wrap',
            }}
          >
            {message.message}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

