const watch=document.querySelector('.mobile-story-watch');
const dialog=document.querySelector('.mobile-story-dialog');
const video=dialog.querySelector('video');
const error=dialog.querySelector('.mobile-story-error');

// The ordinary link remains usable if modules or native dialogs are unsupported.
if(typeof dialog.showModal==='function'){
  watch.setAttribute('aria-haspopup','dialog');
  watch.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    error.hidden=true;
    dialog.showModal();
    document.documentElement.classList.add('mobile-story-open');
    // No source, download or decoder until an explicit user gesture.
    video.src=watch.href;
    video.play().catch(()=>{
      // Native Play remains available if playback is blocked by device policy.
      if(dialog.open&&video.error)error.hidden=false;
    });
  });
  dialog.querySelector('.mobile-story-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{
    video.pause();
    video.removeAttribute('src');
    video.load();
    document.documentElement.classList.remove('mobile-story-open');
    watch.focus({preventScroll:true});
  });
  video.addEventListener('error',()=>{if(dialog.open)error.hidden=false;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();});
  addEventListener('pagehide',()=>{if(dialog.open)dialog.close();});
}
