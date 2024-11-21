console.log('Java Script');

let songs
let currentSong = new Audio;
let currentFolder;

function secondsToMinuteSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00/00:00"
    }
    const minutes = Math.floor(seconds / 60)
    const remainingseconds = Math.floor(seconds % 60)

    const formattedMinutes = String(minutes).padStart(2, 0)
    const formattedremainingseconds = String(remainingseconds).padStart(2, 0)

    return `${formattedMinutes}:${formattedremainingseconds}`
}

async function getsongs(folder) {

    currentFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    console.log(as);

    songs = [];         //creating empty array for contaings the hrefs on songs

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3") || element.href.endsWith(".m4a")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //show all songs playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
                        <li class=" p-1 rounded align-center">
                            <img class="invert" src="image/apple-music.png" alt="">
                            <div class="songinfo">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>Adnan</div>
                            </div>
                            </div>
                            <div class="playnow flex align-center">
                                <span>play now</span>
                                <img src="image/play-circle-filled.png" class="invert" alt="">

                            </div>
                        </li>`;
    }

    // console.log(songs.length);
    if (songs.length <= 5) {
        document.querySelector(".songlist").style.maxHeight = 100 + "%"
    }
    else {
        document.querySelector(".songlist").style.maxHeight = 83 + "%"
    }
    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        // console.log(e.querySelector(".songinfo").firstElementChild);

        e.addEventListener("click", element => {
            console.log(e.querySelector(".songinfo").firstElementChild.innerHTML)
            playMusic(e.querySelector(".songinfo").firstElementChild.innerHTML.trim())
        })
        // console.log(e);

    });

    // console.log(songs);
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currentFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "image/pause-circle-filled.png"
    }
    // currentSong.play();

    document.querySelector(".abovebar").querySelector(".songinfo").innerHTML = decodeURI(track.split(".mp3")[0])

    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}


async function displayAlbums() {
    let a = await fetch("/songs/");
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;

    // console.log(div);
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card-container")
    // console.log(anchors);

    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        // Check if the href contains 'songs/' and extract only the file name
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];
            // console.log(folder);  

            //get the META data of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response);

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                            <div class="image">
                                <img class="song-img" src="songs/${folder}/cover.jpg" alt="home">
                                <div class="play flex">
                                    <img src="image/play.svg" alt="home">
                                </div>
                            </div>
                            <h2>${response.title}</h2>
                            <p>${response.description}</p>
                        </div>`

        }
    };

    //extracting href of the files inside songs
    // Array.from(anchors).forEach(e => {

    //     // Check if the href contains 'songs/' and log the full href
    //     if (e.href.includes("/songs/")) {
    //         console.log(e.href);  // This will log the full href like '/Javascript/Spotify/songs/adnan'
    //     }
    // });

    //load playlist when a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        // console.log(e);

        e.addEventListener("click", async item => {
            // console.log("Fetching Songs")

            console.log(item.currentTarget, item.currentTarget.dataset);
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

}
async function main() {
    //get the list of songs
    await getsongs("songs/ncs")
    playMusic(songs[0], true)
    // console.log(songs);

    //Display all the Albums
    displayAlbums();

    //Attach an event listner to play ,nex and previous buttons
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "image/pause-circle-filled.png"
        }
        else {
            currentSong.pause()
            play.src = " image/play-circle-filled.png"
        }
    })

    //listen for time-update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinuteSeconds(currentSong.currentTime)}
        /${secondsToMinuteSeconds(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 99 + "%"

        //Auto next Song After Completion
        if (currentSong.currentTime / currentSong.duration >= .99) {
        console.log(document.querySelector(".circle").style.left);

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if (index < songs.length - 1) {
            playMusic(songs[index + 1])
        }
        else{
            playMusic(songs[0])
        }
    }
})

document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
    console.log(percent);

    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration) * (percent / 100)

    // console.log(e.target.getBoundingClientRect().width,e.offsetX);

})

//add an event listner for hamburger
document.querySelector("#hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
})

//add an event listner for hamburger close button
document.querySelector("#close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%"
})


//add an event listner for pervious
previous.addEventListener("click", () => {
    // console.log('Previous Clicked');
    console.log(currentSong.src.split("/").slice(-1)[0]);
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if (index > 0 + 1) {
        playMusic(songs[index - 1])
    }
    else {
        playMusic(songs[songs.length - 1])
    }
})


//add an event listner for next
next.addEventListener("click", () => {
    // console.log('Next Clicked');
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    console.log(index);

    if (index < songs.length - 1) {
        playMusic(songs[index + 1])
    }
    else {
        playMusic(songs[0])
    }
})

// add event to volume
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("setting volume to ", e.target.value, "/ 100");
    currentSong.volume = parseInt(e.target.value) / 100;

    //changing volume icon when muted
    if (document.querySelector(".range").getElementsByTagName("input")[0].value == 0) {
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume.svg", "mute.svg")
    }
    //volume icon changes from mute to above '0' 
    else if (document.querySelector(".range").getElementsByTagName("input")[0].value > 0) {
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
    }

})

//add event listener to mute volume
document.querySelector(".volume>img").addEventListener("click", e => {
    // console.log(e.target.src)
    if (e.target.src.includes("volume.svg")) {
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        currentSong.volume = 0;
    }
    else {
        e.target.src = e.target.src.replace("mute.svg", "volume.svg")
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0.10;
        currentSong.volume = 0.10;
    }
})

}
main()
