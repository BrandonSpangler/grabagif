//(function(){

let myKey = "MnahoM9uwxpmTb6yK8WSp6X8aGVEGhDA";


let colOne = document.querySelector(".colOne");
let colTwo = document.querySelector(".colTwo");
let colThree = document.querySelector(".colThree");
let colFour = document.querySelector(".colFour");
let gridContainer = document.querySelector(".gridContainer");
let body = document.querySelector("body");
let searchBar = document.querySelector("input");
let form = document.querySelector("form");

//the url will be different once the page is hosted. Will have to take hostname into acount when slicing the url
  //for now, I'm just going to use the server

let offset = 32;

let me = window.location.hash? window.location.hash.slice(1) : null;

let fetchUrl = "https://api.giphy.com/v1/gifs/trending?api_key="; //want this to be a variable so I can change it to search once enter is pushed

//should I create objects then store a key in the history's state. Giphy doesn't save anything. It looks like it resets.

// maybe add onresize to make mobile friendly

//Gets the initial gif data, creates imageInfoArray in order to push that to the history.state object. Not sure if we can store a ton of info in there.
  // I have no problems visually but I'm not sure what will look best 
function getGifs(){
  let promise = fetch(fetchUrl+myKey+"&limit=32");
  let promise2 = promise.then(resp => resp.json());
  return promise3 = promise2.then(resp => {
	  let imageInfoArray = [];
	    for(let i = 0; i < resp.data.length; i++){
	      let source = resp.data[i].images.fixed_width;//_downsampled;
	      let altText = resp.data[i].title;
	      createImg(source.url, source.height, source.width, altText);
		  imageInfoArray.push({url: source.url, width: source.width, height: source.height, alt: altText});
	    }
		return imageInfoArray;
	  });
}

//load the trending gifs. Don't know a better way to do this. Maybe make a set page function and use that here.
if(!me) getGifs().then(imageInfoArray => {history.replaceState({fetchUrl: fetchUrl, offset:offset, imageInfoArray:imageInfoArray, title: document.title}, "","")});
else {
	fetchUrl = "https://api.giphy.com/v1/gifs/search?q="+me+"&api_key=";
	searchBar.value = me;
	getGifs().then(imageInfoArray => {history.replaceState({fetchUrl: fetchUrl, offset:offset, imageInfoArray:imageInfoArray, title: document.title}, "",me)});
}
//return a random color from the list for the background of pictures
function color(){
	let colors = ["red","purple","pink","lightblue","#49fb35","#ffa000"];
	return colors[(Math.floor(Math.random()*colors.length))];
}
	
//creates one image and adds it to a parent column. Supports FOUR columns I want to be able to change this to make the site mobile friendly	
function createImg(url, height, width, altText){
	let image = document.createElement("img");
	image.src = url;
	image.style.margin = "10px 0px";
	image.style.height = height + "px";
	image.style.width = width + "px";
	image.alt = altText;
	image.style.backgroundColor = color();
	
	let heights = [colOne, colTwo, colThree, colFour].map(column => column.offsetHeight);//can probably use selector here
	[colOne, colTwo, colThree, colFour][heights.indexOf(Math.min(...heights))].appendChild(image);
}

//want to be able to set this up as properly as possible, I don't set the URL and I believe I need to know some node to set up server?
//learn how to make fetch calls more robust
function updateState(event, imageInfoArray){
	if(event.type == "submit"){
		history.pushState({fetchUrl: fetchUrl, offset:offset, imageInfoArray:imageInfoArray, title:`Grab Gifs of ${searchBar.value}!`}, "",searchBar.value);
		document.title = history.state.title;
	}else if(event.type == "scroll"){
		history.state.offset = offset;
		history.replaceState(Object.assign(history.state,{offset: history.state.offset, imageInfoArray: [...history.state.imageInfoArray, ...imageInfoArray]}), "","");
	}
} 

//when the user is scrolled 95% or more of the way down the page fetch more images
function fetchMore(event){
	console.log("fire", (document.documentElement.scrollTop + document.documentElement.clientHeight)/document.documentElement.scrollHeight);
	if(((document.documentElement.scrollTop + document.documentElement.clientHeight)/document.documentElement.scrollHeight >= .95) 
		  && event.type == "scroll"){
		console.log("Called", Date.now());
		fetch(fetchUrl+myKey+"&limit=32&offset="+offset).then(resp => resp.json())
	    .then(resp => {
		    let imageInfoArray = [];
	        for(let i = 0; i < resp.data.length; i++){
				let source = resp.data[i].images.fixed_width;//_downsampled;
				let altText = resp.data[i].title;
				createImg(source.url, source.height, source.width, altText);
				imageInfoArray.push({url: source.url, width: source.width, height: source.height, alt: altText});//make function do all this
		    }
		 	offset += 32;
			updateState(event, imageInfoArray);
		  
		});
	}
}

//add debounce so the scroll event only takes place at the end of a group of scroll events firing
document.addEventListener("scroll", _.debounce(fetchMore, 400));

//when submited, change fetchURL and offset, stop the requests to render(?) images (thye've already been fetched), clear the page, then get more gifs
//  wait for the data to be returned then update the state
form.addEventListener("submit", async function(event){
	fetchUrl = "https://api.giphy.com/v1/gifs/search?q="+encodeURIComponent(searchBar.value.toLowerCase())+"&api_key=";
	event.preventDefault();
	offset = 32;
	window.stop();
	for(let par of [colOne, colTwo, colThree, colFour]){
		for(let child of Array.from(par.children)){
			par.removeChild(child);
		}
	}
	let imageInfoArray = await getGifs();
	updateState(event, imageInfoArray);
});

//when user goes forward or back, stop images from rendering(?), clear the page, create images from the src urls in the state object 
//change fetchUrl, offset, and the document title (important)
window.addEventListener("popstate", event =>{
	if(event.state){
	    window.stop();
	    for(let par of [colOne, colTwo, colThree, colFour]){
			for(let child of Array.from(par.children)){
				par.removeChild(child);
			}
		}
	    for(let {url, height, width, altText} of event.state.imageInfoArray){
		    createImg(url, height, width, altText);
	    }
		fetchUrl = event.state.fetchUrl;
		offset = event.state.offset;
		document.title = event.state.title;
	}
});
//})();

