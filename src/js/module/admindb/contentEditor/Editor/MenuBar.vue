<template>
  <div>
    <template v-for="(item, index) in items">
      <div v-if="item.type === 'divider'" class="divider" :key="`divider${index}`"></div>
      <MenuItem v-else :ref="'menu-' + (item.id || index)" :key="index" v-bind="item" />
    </template>

    <ColorPicker v-if="colorPick" :editor="editor" v-model="color[colorKey]" @close="colorPick = false" />
    <FontSize v-if="fontSizeEditor" :editor="editor" @close="fontSizeEditor = false" />
    <ImageModal v-if="imageModal" @image="setImage" @close="closeImageModal" />
  </div>
</template>

<script>

import MenuItem from './MenuItem.vue';
import ColorPicker from './ColorPicker.vue';
import FontSize from './FontSize.vue';
import ImageModal from './ImageModal.vue';

const invertColor = value => '#' + (parseInt(value.substring(1), 16) ^ 0xffffff | 0x1000000).toString(16).substring(1);

export default {
  components: {
    MenuItem, ColorPicker, FontSize, ImageModal,
  },

  props: {
    editor: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      colorPick: false,
      fontSizeEditor: false,
      imageModal: false,
      colorKey: undefined, // font/bg
      color: {
        font: '#000000',
        bg: '#ffffff',
      },

      items: [
        {
          title: 'Undo',
          icon: 'arrow-go-back-line',
          action: () => this.editor.chain().focus().undo().run(),
        },
        {
          title: 'Redo',
          icon: 'arrow-go-forward-line',
          action: () => this.editor.chain().focus().redo().run(),
        },
        { type: 'divider' },
        {
          title: 'Bold',
          icon: 'bold',
          action: () => this.editor.chain().focus().toggleBold().run(),
          isActive: () => this.editor.isActive('bold'),
        },
        {
          title: 'Italic',
          icon: 'italic',
          action: () => this.editor.chain().focus().toggleItalic().run(),
          isActive: () => this.editor.isActive('italic'),
        },
        {
          title: 'Strike',
          icon: 'strikethrough',
          action: () => this.editor.chain().focus().toggleStrike().run(),
          isActive: () => this.editor.isActive('strike'),
        },
        {
          title: 'Code',
          icon: 'code-view',
          action: () => this.editor.chain().focus().toggleCode().run(),
          isActive: () => this.editor.isActive('code'),
        },
        {
          id: 'fontColor',
          title: 'Selected color: #000000',
          type: 'color',
          icon: 'paint-line',
          action: () => {
            this.colorPick = true;
            this.colorKey = 'font';
          }
        },
        {
          title: 'Set color',
          icon: 'font-color',
          action: () => {
            let style = this.editor.getAttributes('textStyle'),
                fontSize = '';

            if (style.color && style.color.includes('font-size')) {
              fontSize = style.color.slice(style.color.indexOf(';'));
            }

            return this.editor.chain().focus().setColor(this.color.font + fontSize).run();
          },
        },
        {
          id: 'bgColor',
          title: 'Selected background: #ffffff',
          type: 'color',
          icon: 'paint-brush-line',
          action: () => {
            this.colorPick = true;
            this.colorKey = 'bg';
          }
        },
        {
          title: 'Background-color',
          icon: 'terminal-box-fill',
          action: () => this.editor.chain().focus().toggleHighlight({ color: this.color.bg }).run(),
          isActive: () => this.editor.isActive('highlight'),
        },
        { type: 'divider' },
        {
          icon: 'align-left',
          title: 'Left',
          action: () => this.editor.chain().focus().setTextAlign('left').run(),
          isActive: () => this.editor.isActive({ textAlign: 'left' }),
        },
        {
          icon: 'align-center',
          title: 'Center',
          action: () => this.editor.chain().focus().setTextAlign('center').run(),
          isActive: () => this.editor.isActive({ textAlign: 'center' }),
        },
        {
          icon: 'align-right',
          title: 'Right',
          action: () => this.editor.chain().focus().setTextAlign('right').run(),
          isActive: () => this.editor.isActive({ textAlign: 'right' }),
        },
        { type: 'divider' },
        {
          icon: 'h-1',
          title: 'Heading 1',
          action: () => this.editor.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: () => this.editor.isActive('heading', { level: 1 }),
        },
        {
          icon: 'h-2',
          title: 'Heading 2',
          action: () => this.editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: () => this.editor.isActive('heading', { level: 2 }),
        },
        {
          icon: 'h-3',
          title: 'Heading 3',
          action: () => this.editor.chain().focus().toggleHeading({ level: 3 }).run(),
          isActive: () => this.editor.isActive('heading', { level: 3 }),
        },
        {
          icon: 'h-4',
          title: 'Heading 4',
          action: () => this.editor.chain().focus().toggleHeading({ level: 4 }).run(),
          isActive: () => this.editor.isActive('heading', { level: 4 }),
        },
        {
          icon: 'paragraph',
          title: 'Paragraph',
          action: () => this.editor.chain().focus().setParagraph().run(),
          isActive: () => this.editor.isActive('paragraph'),
        },
        {
          icon: 'font-size',
          title: 'Set Font-Size',
          action: () => this.fontSizeEditor = true,
        },
        {
          icon: 'list-unordered',
          title: 'Bullet List',
          action: () => this.editor.chain().focus().toggleBulletList().run(),
          isActive: () => this.editor.isActive('bulletList'),
        },
        {
          icon: 'list-ordered',
          title: 'Ordered List',
          action: () => this.editor.chain().focus().toggleOrderedList().run(),
          isActive: () => this.editor.isActive('orderedList'),
        },
        /*{
          icon: 'list-check-2',
          title: 'Task List',
          action: () => this.editor.chain().focus().toggleTaskList().run(),
          isActive: () => this.editor.isActive('taskList'),
        },*/
        {
          icon: 'code-box-line',
          title: 'Code Block',
          action: () => this.editor.chain().focus().toggleCodeBlock().run(),
          isActive: () => this.editor.isActive('codeBlock'),
        },
        { type: 'divider' },
        {
          icon: 'double-quotes-l',
          title: 'Blockquote',
          action: () => this.editor.chain().focus().toggleBlockquote().run(),
          isActive: () => this.editor.isActive('blockquote'),
        },
        {
          icon: 'separator',
          title: 'Horizontal Rule',
          action: () => this.editor.chain().focus().setHorizontalRule().run(),
        },
        { type: 'divider' },
        {
          icon: 'text-wrap',
          title: 'Hard Break',
          action: () => this.editor.chain().focus().setHardBreak().run(),
        },
        {
          icon: 'link',
          title: 'Set Link by selected text',
          action: () => {
            const href = window.prompt('URL');

            if (href) {
              this.editor.chain().focus().setLink({ href }).run()
            }
          },
          isActive: () => this.editor.isActive('link'),
        },
        {
          icon: 'link-unlink',
          title: 'Remove Link',
          action: () => this.editor.chain().focus().unsetLink().run(),
        },
        { type: 'divider' },
        {
          icon: 'image-fill',
          title: 'Set Image',
          action: () => this.imageModal = true,
        },
      ],
    }
  },
  watch: {
    color: {
      deep: true,
      handler() {
        let btn = this.$refs['menu-fontColor'][0].$el;
        btn.style.color = this.color.font;
        btn.style.background = invertColor(this.color.font);
        btn.title = 'Selected color: ' + this.color.font;

        btn = this.$refs['menu-bgColor'][0].$el;
        btn.style.color = invertColor(this.color.bg);
        btn.style.background = this.color.bg;
        btn.title = 'Selected background: ' + this.color.bg;
      },
    },
    fontColor() {
    },
  },
  methods: {
    setImage(src) {
      this.editor.chain().focus().setImage({ src }).run();
      this.closeImageModal();
    },

    closeImageModal() {
      this.imageModal = false;
    }
  },
}
</script>

<style lang="scss">
.divider {
  width: 2px;
  height: 1.25rem;
  background-color: rgba(#000, 0.1);
  margin-left: 0.5rem;
  margin-right: 0.75rem;
}
</style>
