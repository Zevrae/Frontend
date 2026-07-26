import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Heading2, Undo2, Redo2 } from 'lucide-react';

// ─── Default Template ─────────────────────────────────────────────────────────

const PRODUCT_TEMPLATE = `
  <h2>Materials & Construction</h2>
  <ul>
    <li><strong>Composition:</strong> 100% Premium Cotton — 240 GSM oversized fit</li>
    <li><strong>Origin:</strong> Ethically produced in limited quantities</li>
    <li><strong>Finish:</strong> Enzyme-washed for a lived-in softness</li>
  </ul>

  <h2>Fit & Sizing</h2>
  <ul>
    <li>Oversized silhouette — size down for a relaxed fit</li>
    <li>Drop shoulders, extended hem</li>
    <li>Crew neck collar with double stitching</li>
  </ul>

  <h2>Care Instructions</h2>
  <ul>
    <li>Machine wash cold, inside out</li>
    <li>Do not tumble dry</li>
    <li>Iron on low heat, avoid print</li>
    <li>Do not bleach</li>
  </ul>

  <h2>Delivery & Returns</h2>
  <p>Free shipping on orders above ₹999.</p>
  <p>Dispatched within 2–4 business days. Delivery in 5–8 days.</p>
  <p>14-day returns accepted on unworn, unaltered items with original tags intact.</p>
`;

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      className={`p-1.5 rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active
          ? 'bg-[#C5A059]/15 text-[#C5A059]'
          : 'text-[#EAE6E1]/50 hover:text-[#EAE6E1] hover:bg-[#EAE6E1]/5'
      }`}
    >
      {children}
    </button>
  );
}

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Write a product description…' 
}: RichTextEditorProps) {
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
      }),
      Placeholder.configure({ placeholder }),
    ],
    // 1. Inject the template as the default value if 'value' is empty
    content: value || PRODUCT_TEMPLATE,
    editorProps: {
      attributes: {
        class:
          'prose-invert max-w-none text-[12px] font-mono text-[#EAE6E1] focus:outline-none min-h-[120px] px-3 py-2.5 ' +
          '[&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_ul]:pl-5 [&_ol]:pl-5 [&_ul]:list-disc [&_ol]:list-decimal ' +
          '[&_h2]:text-[13px] [&_h2]:uppercase [&_h2]:tracking-[0.1em] [&_h2]:text-[#C5A059] [&_h2]:my-2 ' +
          '[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:float-left ' +
          '[&_.is-editor-empty:first-child::before]:text-[#EAE6E1]/20 [&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:h-0',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    
    const current = editor.getHTML();
    
    // 2. If the parent state is empty, but the editor just loaded the template,
    // sync the template UP to the parent state so they match.
    if (!value && current === PRODUCT_TEMPLATE) {
      onChange(PRODUCT_TEMPLATE);
      return;
    }

    // 3. Normal sync: if parent value changes (e.g. from an API fetch), update editor
    if (value !== current && value !== undefined) {
      editor.commands.setContent(value || '', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="w-full bg-[#12100C] border border-[#EAE6E1]/10 rounded-sm focus-within:border-[#C5A059]/40 transition-colors">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[#EAE6E1]/10">
        <ToolbarButton
          label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={13} />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={13} />
        </ToolbarButton>
        <ToolbarButton
          label="Heading"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={13} />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={13} />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={13} />
        </ToolbarButton>
        <div className="w-px h-4 bg-[#EAE6E1]/10 mx-1" />
        <ToolbarButton
          label="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={13} />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={13} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}