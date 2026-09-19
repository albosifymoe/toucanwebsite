// Progressive enhancements only: navigation and content work without JavaScript.
const menu=document.querySelector('.mobile-menu');
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary').focus();}});
document.addEventListener('click',event=>{if(menu?.open&&!menu.contains(event.target))menu.open=false;});
menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.open=false;}));

const filters=document.querySelector('.work-filters');
if(filters){
  filters.hidden=false;
  const cards=[...document.querySelectorAll('.work-card')],buttons=[...filters.querySelectorAll('button')];
  const apply=value=>{
    if(!buttons.some(b=>b.dataset.filter===value))value='All';
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===value)));
    cards.forEach(c=>{c.hidden=value!=='All'&&c.dataset.category!==value;});
    const count=cards.filter(c=>!c.hidden).length;
    document.querySelector('.results-count').textContent=`${count} project${count===1?'':'s'}`;
  };
  apply(new URL(location.href).searchParams.get('category')||'All');
  filters.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    apply(button.dataset.filter);
    const url=new URL(location.href);
    if(button.dataset.filter==='All')url.searchParams.delete('category');else url.searchParams.set('category',button.dataset.filter);
    history.pushState(null,'',url);
  });
  addEventListener('popstate',()=>apply(new URL(location.href).searchParams.get('category')||'All'));
}

const dialog=document.querySelector('.lightbox');
if(dialog&&typeof dialog.showModal==='function'){
  const images=[...document.querySelectorAll('[data-gallery]')];let current=0,trigger;
  const show=index=>{
    current=(index+images.length)%images.length;
    const link=images[current],image=dialog.querySelector('img');
    image.src=link.href;image.alt=link.querySelector('img').alt;
    document.querySelector('#lightbox-caption').textContent=link.dataset.caption;
  };
  images.forEach((link,index)=>link.addEventListener('click',event=>{
    if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();trigger=link;show(index);dialog.showModal();document.body.classList.add('viewer-open');
  }));
  dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
  dialog.querySelector('[data-previous]').addEventListener('click',()=>show(current-1));
  dialog.querySelector('[data-next]').addEventListener('click',()=>show(current+1));
  dialog.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(current+(event.key==='ArrowLeft'?-1:1));}
  });
  dialog.addEventListener('close',()=>{document.body.classList.remove('viewer-open');dialog.querySelector('img').removeAttribute('src');trigger?.focus({preventScroll:true});});
}

const form=document.querySelector('#enquiry-form');
if(form){
  form.hidden=false;
  const preview=document.querySelector('#enquiry-preview'),draft=document.querySelector('#enquiry-text');
  const service=new URL(location.href).searchParams.get('service');
  form.querySelectorAll('[data-service]').forEach(input=>{input.checked=input.dataset.service===service;});
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const data=new FormData(form),selected=data.getAll('services');
    const body=`Hello Toucan,\n\n${String(data.get('message')).trim()}\n\nName: ${String(data.get('name')).trim()}\nEmail: ${data.get('email')}${data.get('company')?`\nCompany: ${data.get('company')}`:''}${data.get('phone')?`\nPhone: ${data.get('phone')}`:''}\nInterested in: ${selected.length?selected.join(', '):'Let’s discuss'}\n`;
    draft.value=body;
    document.querySelector('#open-email').href=`mailto:info@toucan.ly?subject=${encodeURIComponent('Project enquiry — '+data.get('name'))}&body=${encodeURIComponent(body)}`;
    document.querySelector('#copy-status').textContent='';
    form.hidden=true;preview.hidden=false;document.querySelector('#preview-title').focus();
  });
  document.querySelector('#edit-enquiry').addEventListener('click',()=>{preview.hidden=true;form.hidden=false;form.elements.name.focus();});
  document.querySelector('#copy-enquiry').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(draft.value);document.querySelector('#copy-status').textContent='Enquiry copied. Paste it into an email to info@toucan.ly.';}
    catch{draft.focus();draft.select();document.querySelector('#copy-status').textContent='Select and copy the draft, then paste it into your email.';}
  });
}
