/* eslint-disable no-unused-vars */
import PlaceIcon from '@mui/icons-material/Place';
const SearchResult=(props)=>{
  return <div onClick={props.onClick} onMouseOut={props.onMouseOut} cords={props.cords} className="result">
      <div className="resultlogo">
         <PlaceIcon/>
      </div>
      <div className="resulttext">
        <p>
          {props.address}
        </p>
      </div>
  </div>
}
export default SearchResult;