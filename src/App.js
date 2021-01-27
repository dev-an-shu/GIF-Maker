import React, { useState, useEffect } from 'react';
//import logo from './logo.svg';
import './App.css';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const ffmpeg = createFFmpeg({ log: true });

function App() {
  
  const [ ready, setReady ] = useState(false);
  const [ error, setError ] = useState("");
  const [ video, setVideo ] = useState();
  const [ gif, setGif ] = useState();
  const [ gifInfo, setGifInfo ] = useState({'time': '2.5', 'startSecond': '2.0'});

  const handleChange = e => {
    setGifInfo(state => ({...state, [e.target.name]: e.target.value}));
  }

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  }

  const convertToGif = async () => {

    console.log("Gif Info: ",gifInfo);
    if (!video){
      setError("Select Video");
      return;
    }
    else{
      setError("");
    }

    //Write file to memory
    ffmpeg.FS('writeFile', video.name, await fetchFile(video));

    //Run the FFMPEG command
    await ffmpeg.run('-i', video.name, '-t', gifInfo.time, '-ss', gifInfo.startSecond, '-f', 'gif', 'out.gif');

    // Read the result
    const data = ffmpeg.FS('readFile', 'out.gif');

    // Create a URL
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));
    setGif(url)
  }

  //
  useEffect(() => {
    load();
  }, [])

  return ready ? (
    <div className="App">
      <h1>GIF Maker</h1>
      <div className="VideoDisplay">
      { video && 
        <video
        controls
        width="250"
        src={URL.createObjectURL(video)}>

        </video>
      }
      </div>

      <div className="VideoFile">
      <input type='file' onChange={e => {setVideo(e.target.files?.item(0))}} />
      </div>

      <div className="Duration">
        <label>Duration: </label>
        <input type='number' step='0.1' placeholder='0.0' name='time' value={gifInfo.time} onChange={event => handleChange(event)} />
      </div>      
      
      <div className="Time">
        <label>Starting Time:</label>
        <input type='number' step='0.1' placeholder='0.0' name='startSecond' value={gifInfo.startSecond} onChange={event => handleChange(event)} />
      </div>

      {gif && <h3>Result</h3>}

      <button className="convert" onClick={convertToGif}>Convert</button>

      {error && <div className="errormsg">{ error }</div>}

      <div className="gif">
        { gif && 
        <div>
          <img src={gif} width="250" />
          <a className="download" href={gif} title="Result" download="Result.gif">Download</a>
        </div>}
      </div>
    </div>
  ) :
  (<p>Loading...</p>);
}

export default App;
