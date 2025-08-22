(function(blocks, element, blockEditor, components, data){
  const el = element.createElement;
  const Fragment = element.Fragment;
  const MediaUpload = blockEditor.MediaUpload;
  const MediaUploadCheck = blockEditor.MediaUploadCheck;
  const InspectorControls = blockEditor.InspectorControls;
  const useBlockProps = blockEditor.useBlockProps;
  const PanelBody = components.PanelBody;
  const Button = components.Button;
  const TextControl = components.TextControl;
  const RangeControl = components.RangeControl;
  const ToggleControl = components.ToggleControl;

  function parseYouTube(url){
    const m = String(url||"").match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return m ? m[1] : null;
  }

  blocks.registerBlockType('igl/gallery', {
    apiVersion: 2,
    title: 'Inline Gallery Lightbox',
    icon: 'format-gallery',
    category: 'media',
    attributes: {
      items: { type: 'array', default: [] },
      columns: { type: 'number', default: 4 },
      gap: { type: 'number', default: 10 },
      maxInitial: { type: 'number', default: 8 },
    },
    edit: function(props){
      const { attributes, setAttributes } = props;
      const blockProps = useBlockProps({ className: 'igl-block' });
      const items = attributes.items || [];
      const addImages = (imgs)=>{
        const next = imgs.map(img => ({ type:'image', id: img.id, url: img.url, alt: img.alt || '' }));
        setAttributes({ items: items.concat(next) });
      };
      const addYouTube = (url)=>{
        const id = parseYouTube(url);
        if (!id) { window.alert('有効なYouTube URLを入力してください'); return; }
        const thumbnail = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
        setAttributes({ items: items.concat([{ type:'youtube', videoId:id, thumbnail }]) });
      };
      const removeAt = (idx)=>{
        setAttributes({ items: items.filter((_,i)=>i!==idx) });
      };

      // preview grid
      const gridStyle = { display:'grid', gridTemplateColumns:`repeat(${attributes.columns||4}, 1fr)`, gap: `${attributes.gap||10}px` };
      const first = items.slice(0, attributes.maxInitial||8);
      const rest = items.slice(attributes.maxInitial||8);

      return el(Fragment, {},
        el('div', blockProps,
          !items.length && el('div', { className:'igl-placeholder' }, '画像や動画を追加'),
          el('div', { className:'game-mod-images', style: gridStyle },
            first.map((it, idx)=> el('div', { className:'igl-item-preview', key:'f'+idx },
              it.type==='image' ? el('img',{src:it.url, alt:it.alt||''}) : el('div', { className:'thumb', style:{backgroundImage:`url(${it.thumbnail})`, backgroundSize:'cover'} }),
              el('button', { className:'igl-remove', onClick:()=>removeAt(idx) }, '×')
            ))
          ),
          rest.length ? el('div', { className:'game-mod-images-more', style: gridStyle },
            rest.map((it, i)=> el('div', { className:'igl-item-preview', key:'r'+i },
              it.type==='image' ? el('img',{src:it.url, alt:it.alt||''}) : el('div', { className:'thumb', style:{backgroundImage:`url(${it.thumbnail})`, backgroundSize:'cover'} }),
              el('button', { className:'igl-remove', onClick:()=>removeAt(i + (attributes.maxInitial||8)) }, '×')
            ))
          ) : null
        ),
        el(InspectorControls, {},
          el(PanelBody, { title: 'メディア' },
            el(MediaUploadCheck, {},
              el(MediaUpload, {
                onSelect: addImages,
                allowedTypes: ['image'],
                multiple: true,
                gallery: true,
                value: items.filter(it=>it.type==='image').map(it=>it.id),
                render: ({open}) => el(Button, { isPrimary:true, onClick:open }, '画像を追加')
              })
            ),
            el(TextControl, {
              label: 'YouTube URL 追加',
              placeholder: 'https://www.youtube.com/watch?v=...',
              onChange: (v)=> props.youtubeTmp=v
            }),
            el(Button, { onClick: ()=> addYouTube(props.youtubeTmp||'') }, '動画を追加')
          ),
          el(PanelBody, { title: 'レイアウト' },
            el(RangeControl, { label:'列数', value: attributes.columns, onChange:(v)=>setAttributes({columns:v}), min:1, max:8 }),
            el(RangeControl, { label:'余白(px)', value: attributes.gap, onChange:(v)=>setAttributes({gap:v}), min:0, max:40 }),
            el(RangeControl, { label:'初期表示数 (最大10)', value: attributes.maxInitial, onChange:(v)=>setAttributes({maxInitial:v}), min:0, max:10 }),
          )
        )
      );
    },
    save: function(){ return null; } // server render
  });
})(window.wp.blocks, window.wp.element, window.wp.blockEditor, window.wp.components, window.wp.data);
