import { useEffect, useRef } from 'react';
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
  
  // Tracks the last HTML string we emitted via onChange (i.e. from user input).
  // If the `value` prop changes to exactly this string, it's just React
  // reflecting our own edit back down — we must NOT call setContent or we'll
  // reset the editor cursor / undo-stack mid-edit.
  const lastEmittedHtml = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
      }),
      Placeholder.configure({ placeholder }),
    ],
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
      const html = editor.getHTML();
      // Record what we're about to emit so the useEffect knows it came from
      // the user, not from an external prop change.
      lastEmittedHtml.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;

    // If value matches what we just sent via onUpdate, this is just React
    // reflecting our own edit back — skip to avoid resetting the editor.
    if (value === lastEmittedHtml.current) return;

    // Genuinely external change (e.g. opening a different product for editing,
    // or initial mount sync). Update the editor content.
    const current = editor.getHTML();

    // Handle the "new product" case: value is empty but editor loaded the
    // template — sync the template up to the parent form state.
    if (!value && current) {
      lastEmittedHtml.current = current;
      onChange(current);
      return;
    }

    if (value !== undefined && value !== current) {
      editor.commands.setContent(value || '', false);
    }
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