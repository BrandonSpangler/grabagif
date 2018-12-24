//(function(){

let apiKey = "MnahoM9uwxpmTb6yK8WSp6X8aGVEGhDA";


let colOne = document.querySelector(".colOne");
let colTwo = document.querySelector(".colTwo");
let colThree = document.querySelector(".colThree");
let colFour = document.querySelector(".colFour");
let gridContainer = document.querySelector(".gridContainer");
let body = document.querySelector("body");
let searchBar = document.querySelector("input");
let form = document.querySelector("form");

//create a global state object
    // offset: number of Gifs to ask giphy api for, fetchUrl: the Url to pass into the gif
let stateObj = {
	offset: 0, //will need to remember to reset this
	fetchUrl: window.location.hash ? 
	        "https://api.giphy.com/v1/gifs/search?q="+fetchUrlFormat(location.hash.slice(1))+"&api_key="
		  : "https://api.giphy.com/v1/gifs/trending?api_key=",
	title: document.title,
	searchValue: window.location.hash ? safeUrl(window.location.hash.slice(1)).replace(/\-/," ") : null
};



function safeUrl(url){
	return decodeURIComponent(url).replace(/[^\w\s\-]/g,"").replace(/(\s{2,})/g," ").replace(/(^\s+?|\s+?$)/g,"").replace(/\s/g,"-").toLowerCase();
}
function fetchUrlFormat(url){
	return safeUrl(url).replace(/\-/,"+")
}

// maybe add onresize to make mobile friendly


//first call
history.replaceState(stateObj, "", window.location.hash ? location.pathname + "#" + safeUrl(location.hash.slice(1)): location.pathname);
getGifs({type:null});
searchBar.value = stateObj.searchValue;


function getGifs(event){
	fetch(stateObj.fetchUrl + apiKey + "&limit=32&offset=" + stateObj.offset)
	.then(resp => resp.json())
	.then(resp => {
		if(resp.data.length == 0){/*need no (more) gifs message then return*/console.log("no gifs")} //giphy does not return a 204 message
		for(let i = 0; i < resp.data.length; i++){
				let source = resp.data[i].images.fixed_width;//_downsampled;
				let altText = resp.data[i].title;
				addImg(source.url, source.height, source.width, altText);
		}
	})//.catch( );//error function?
}


//load the trending gifs. Don't know a better way to do this. Maybe make a set page function and use that here.
//return a random color from the list for the background of pictures
function color(){
	let colors = ["red","purple","pink","#50BFE6","#49fb35","#ffa000"];//red,purple,pink,blue,green,orange
	return colors[(Math.floor(Math.random()*colors.length))];
}
	
//creates one image and adds it to a parent column. Supports FOUR columns I want to be able to change this to make the site mobile friendly	
function addImg(url, height, width, altText){
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

//updates both stateobj and pushes new state object to history
function updateState(event){
	if(event.type == "submit"){ //null for first call
		stateObj = Object.assign(stateObj, {offset: 0, searchValue: searchBar.value, 
			            fetchUrl: "https://api.giphy.com/v1/gifs/search?q="+fetchUrlFormat(searchBar.value)+"&api_key=", 
	                    title: `Grab Gifs of ${safeUrl(searchBar.value).replace(/\-/g, " ")}!`});
		history.pushState(stateObj, "", location.pathname + "#" + safeUrl(searchBar.value));
		document.title = stateObj.title;
	}else if(event.type == "scroll"){
        stateObj = Object.assign(stateObj, {offset: stateObj.offset + 32});
		history.replaceState(stateObj, "", location.pathname + "#" + safeUrl(searchBar.value));
	}else if(event.type == "popstate"){
		stateObj = Object.assign(stateObj, {offset: 0, fetchUrl: event.state.fetchUrl, searchValue: event.state.searchValue, title: event.state.title});
		searchBar.value = stateObj.searchValue;
		document.title = event.state.title;
	}
} 


function clearGifs(){
	for(let column of [colOne, colTwo, colThree, colFour]){
		for(let child of Array.from(column.children)){
			column.removeChild(child);
		}
	}
}

//add debounce so the scroll event only takes place at the end of a group of scroll events firing
document.addEventListener("scroll", _.debounce((event) => {
	//console.log("called");
	if((document.documentElement.scrollTop + document.documentElement.clientHeight)/document.documentElement.scrollHeight < .95){return;}
	updateState(event); 
	getGifs(event);
	//console.log("fired");
}, 400));

//when submited, change fetchURL and offset, stop the requests to render(?) images (they've already been fetched), clear the page, then get more gifs
//  wait for the data to be returned then update the state
form.addEventListener("submit", event => {
	if(searchBar.value == ""){return;}
	event.preventDefault();
	searchBar.value = searchBar.value.replace(/[^\w\s]/,"").replace(/(\s{2,})/g," ").replace(/(^\s+?|\s+?$)/,"").toLowerCase();
	window.stop();//need this still?
	clearGifs();
	updateState(event);
	getGifs(event);
});

//when user goes forward or back, stop images from rendering, clear the page, create images from the src urls in the state object 
//change fetchUrl, offset, and the document title (important)
window.addEventListener("popstate", event =>{
	if(event.state){
		window.stop();
		clearGifs();
		updateState(event);
		getGifs(event);
	}
});
//})();