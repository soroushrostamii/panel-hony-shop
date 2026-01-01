import { Box, TextField, Typography, Button, IconButton } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

export default function ProductDescription({ values, setValues }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: values.description || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      setValues(prev => ({
        ...prev,
        description: editor.getHTML(),
      }));
    },
  });

  // Update editor content when values.description changes externally
  useEffect(() => {
    if (editor && values.description !== editor.getHTML()) {
      editor.commands.setContent(values.description || '');
    }
  }, [values.description, editor]);

  const handleChange = event => {
    const { name, value } = event.target;
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async event => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const base64Files = await Promise.all(
      files.map(
        file =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );
    setValues(prev => ({
      ...prev,
      images: [...prev.images, ...base64Files],
    }));
    event.target.value = '';
  };

  const handleRemoveImage = index => {
    setValues(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  if (!editor) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* ردیف اول: توضیح کوتاه */}
      <Box sx={{ width: '100%' }}>
        <TextField
          label="توضیح کوتاه"
          name="shortDescription"
          value={values.shortDescription}
          onChange={handleChange}
          fullWidth
          multiline
          rows={2}
        />
      </Box>

      {/* ردیف دوم: ادیتور */}
      <Box sx={{ width: '100%' }}>
        <Typography variant="body2" fontWeight={600} mb={1}>
          توضیحات کامل
        </Typography>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
            width: '100%',
            '& .tiptap': {
              minHeight: '200px',
              padding: 2,
              '& p.is-editor-empty:first-child::before': {
                content: 'attr(data-placeholder)',
                float: 'right',
                color: '#adb5bd',
                pointerEvents: 'none',
                height: 0,
              },
              '& p': {
                margin: '0.5em 0',
              },
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                margin: '0.5em 0',
                fontWeight: 600,
              },
              '& ul, & ol': {
                paddingRight: '1.5em',
                margin: '0.5em 0',
              },
              '& strong': {
                fontWeight: 700,
              },
              '& em': {
                fontStyle: 'italic',
              },
              '& code': {
                backgroundColor: '#f4f4f4',
                padding: '2px 4px',
                borderRadius: '3px',
                fontFamily: 'monospace',
              },
              '& pre': {
                backgroundColor: '#f4f4f4',
                padding: '1em',
                borderRadius: '4px',
                overflow: 'auto',
              },
              '& blockquote': {
                borderRight: '4px solid #ddd',
                paddingRight: '1em',
                margin: '1em 0',
                fontStyle: 'italic',
              },
            },
          }}
        >
          <Box
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              p: 1,
              display: 'flex',
              gap: 0.5,
              flexWrap: 'wrap',
            }}
          >
            <Button
              size="small"
              variant={editor.isActive('bold') ? 'contained' : 'text'}
              onClick={() => editor.chain().focus().toggleBold().run()}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              <strong>B</strong>
            </Button>
            <Button
              size="small"
              variant={editor.isActive('italic') ? 'contained' : 'text'}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              <em>I</em>
            </Button>
            <Button
              size="small"
              variant={editor.isActive('heading', { level: 1 }) ? 'contained' : 'text'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              H1
            </Button>
            <Button
              size="small"
              variant={editor.isActive('heading', { level: 2 }) ? 'contained' : 'text'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              H2
            </Button>
            <Button
              size="small"
              variant={editor.isActive('bulletList') ? 'contained' : 'text'}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              •
            </Button>
            <Button
              size="small"
              variant={editor.isActive('orderedList') ? 'contained' : 'text'}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              1.
            </Button>
            <Button
              size="small"
              variant={editor.isActive('blockquote') ? 'contained' : 'text'}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              "
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              ↶
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              ↷
            </Button>
          </Box>
          <EditorContent
            editor={editor}
            data-placeholder="توضیحات محصول را اینجا بنویسید..."
          />
        </Box>
      </Box>

      {/* ردیف سوم: آپلود تصاویر */}
      <Box sx={{ width: '100%' }}>
        <Typography fontWeight={600} mb={1}>
          تصاویر محصول
        </Typography>
        <Button variant="outlined" component="label" startIcon={<Add />}>
          آپلود تصویر
          <input
            hidden
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        </Button>
        {values.images.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            {values.images.map((image, index) => (
              <Box
                key={index}
                sx={{
                  width: 80,
                  height: 80,
                  position: 'relative',
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={image}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveImage(index)}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bgcolor: 'rgba(255,255,255,0.8)',
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

