/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import BingMapsReact from "bingmaps-react";
import SearchResult from "./SearchResult";
import env from "react-dotenv";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';


export default function BingMap(props) {
  const [bingMapReady, setBingMapReady] = useState(false); // added a new state to use in bingmapsreact
  const [trucks, setTrucks] = useState([]);
  const [isError, setError] = useState(false)
  const [text, setText] = useState("");
  const [suggestion, setSuggestion] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false)
  const defaultLocation = {
    center: {
      latitude: 37.766897602559155,
      longitude: -122.42032247306807,
    },
    mapTypeId: "grayscale",
    zoom: 12,
  }
  const [center, setCenter] = useState(defaultLocation);
  //search suggestion
  const fetchSuggestion = async (query) => {
    await fetch(`https://dev.virtualearth.net/REST/v1/Locations/${query}?maxResult=3&o=json&key=${env.KEY}`)
      .then((res) => res.json())
      .then((data) => {
        setSuggestion(data.resourceSets[0].resources);
      })
      .catch((e) => console.log(e));
  };

  //handle search Query

  const handleSearch = (query) => {
    setLoading(true)
    setSuggestion([])
    fetch(`https://dev.virtualearth.net/REST/v1/Locations/${query}?maxResult=3&o=json&key=${env.KEY}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (data.resourceSets[0].resources.length !== 0) {
          addPushPins(data.resourceSets[0].resources[0].point.coordinates);
          setLoading(false)
          
        } else {
          // setEmpty(true)
          setSuggestion([])
          setError(true)
          setLoading(false)
          setTimeout(() => {
            setIsSearching(false);
            setError(false)
          }, 3000);
        }
        setIsSearching(true);

      })
      .catch((e) => console.log(e));

  }

  //set display fetched data on map  
  const addPushPins = (cord) => {
    setSuggestion([])
    fetch(
      `https://data.sfgov.org/resource/rqzj-sfat.json?$select=facilitytype,applicant,location&status=APPROVED&$where=within_circle(location,${cord[0]},${cord[1]}, 5000)`
    )
      .then((res) => res.json())
      .then((data) => {
        data.map((e) => {
          const info = {
            center: {
              longitude: e.location.longitude,
              latitude: e.location.latitude,
            },
            options: {
              title: e.applicant,
              subTitle: `${e.facilitytype} Service`,
              color:"black",
              // icon:"https://cdn-icons-png.flaticon.com/512/31/31520.png" unable to edit size
            },
          };

          setTrucks((prev) => {
            let duplicate = false;
            prev.forEach((truck) => {
              if (truck.options.title === info.options.title) {
                duplicate = true;
              }
            });
            return !duplicate ? [...prev, info] : prev;
          });
        });
      })
      .then(data => {
        setCenter({
          center: {
            latitude: cord[0],
            longitude: cord[1],
          },
          mapTypeId: "grayscale",
          zoom: 12,
        })
        setIsSearching(true);
      })
      .catch((e) => console.log(e))
  }



  return (
    <>
    {/* LOADING COMPONENT */}
      <div className={`loading ${!loading && "hide"} `}><Box sx={{ display: 'flex' }}>
        <CircularProgress />
      </Box></div>

    {/* ERROR MESSAGE */}

      <p className={`error ${!isError && "hide"} `}>Location found!</p>

    {/* BACK BUTTON */}
    
      <p
        onClick={() => {
          setIsSearching(false);
        }}
        className={`back ${(!isSearching) && "hide"}`}
      >
        Go Back
      </p>


    {/* SEARCH BAR */}
    
      <div className={`searchbar ${isSearching && "hide"}`} >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(text);
          }}
        >
          <input
            placeholder="Enter Street name or City and press enter"
            type="text"
            onChange={(e) => {
              if (e.target.value.length === 0) {
                setSuggestion([]);
              }
              setText(e.target.value);
              if (text.length > 1) {
                fetchSuggestion(text)
              }

            }}
            autoComplete="true"
            value={text}

          />
          <CloseIcon
            onClick={() => {
              setText('');
              setError(false);
              setSuggestion([]);
            }}
          />

        </form>
        <div className="searchbar-results">
          {suggestion.map((location) => {
            return (
              <SearchResult
                address={location.address.formattedAddress}
                onClick={(e) => {
                  addPushPins(location.point.coordinates)
                }}
              />
            );
          })}
        </div>
      </div>
      <header>
        <h1>Food Truck Finder</h1>
      </header>

    {/* MAP COMPONENT */}

      <BingMapsReact
        className="map"
        bingMapsKey={env.KEY}
        height="100%"
        mapOptions={{
          navigationBarMode: "square",
          showLocateMeButton: true,
        }}
        pushPins={bingMapReady ? trucks : null}
        onMapReady={function () {
          setBingMapReady(true);
          console.log("map is ready");
        }}
        width="100%"
        viewOptions={center}
      />
    </>
  );
}
