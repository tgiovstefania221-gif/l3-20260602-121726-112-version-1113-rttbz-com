(function(){
var menuButton=document.querySelector("[data-menu-toggle]");
var mobileMenu=document.querySelector("[data-mobile-menu]");
if(menuButton&&mobileMenu){menuButton.addEventListener("click",function(){mobileMenu.classList.toggle("is-open");});}
var carousel=document.querySelector("[data-hero-carousel]");
if(carousel){var slides=[].slice.call(carousel.querySelectorAll(".hero-slide"));var dots=[].slice.call(carousel.querySelectorAll("[data-hero-dot]"));var index=0;function show(i){index=(i+slides.length)%slides.length;slides.forEach(function(slide,n){slide.classList.toggle("is-active",n===index);});dots.forEach(function(dot,n){dot.classList.toggle("is-active",n===index);});}dots.forEach(function(dot,n){dot.addEventListener("click",function(){show(n);});});show(0);setInterval(function(){show(index+1);},5200);}
var search=document.querySelector("[data-filter-search]");
var year=document.querySelector("[data-filter-year]");
var region=document.querySelector("[data-filter-region]");
var cards=[].slice.call(document.querySelectorAll(".movie-card"));
function normalize(v){return (v||"").toString().toLowerCase().trim();}
function runFilter(){var q=normalize(search&&search.value);var y=year&&year.value;var r=region&&region.value;cards.forEach(function(card){var ok=true;if(q&&normalize(card.getAttribute("data-search")).indexOf(q)<0)ok=false;if(y&&card.getAttribute("data-year")!==y)ok=false;if(r&&card.getAttribute("data-region")!==r)ok=false;card.classList.toggle("hide-card",!ok);});}
[search,year,region].forEach(function(el){if(el)el.addEventListener("input",runFilter);if(el)el.addEventListener("change",runFilter);});
})();