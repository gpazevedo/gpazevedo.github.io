document.querySelector('.blog-nav-hamburger')?.addEventListener('click', function(){
  this.closest('nav').classList.toggle('nav-open');
});
