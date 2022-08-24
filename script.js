'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; //lat, lng
    this.distance = distance; //in km
    this.duration = duration; //in hrs
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace(){
    this.pace = this.duration/this.distance;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed(){
    //km/h
    this.speed = this.distance/(this.duration/60);
  }
}

//Application Architecture
class App{
  #map;
  #mapEvent;
  #workouts = [];
  constructor(){
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
      if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition(
          this._loadMap.bind(this),
          function () {
            alert('Could not get your position');
          }
        );
    }

  _loadMap(position){
    console.log(position);
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const coords = [latitude, longitude];
      this.#map = L.map('map').setView(coords, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.#map);


      //Handling click on map
      this.#map.on('click', this._showForm.bind(this));
  }


  _showForm(mapE){
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField(){
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e){
    const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();
    //Get form data
    const type = inputType.value;
    const distance = +inputDistance.value; //convert to number
    const duration = +inputDuration.value; //convert to number
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    //Validate form data
    //If workout is running create running object
    //If workout is cycling create cycling object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (!validInputs(distance, duration, cadence) || !allPositive(distance, duration,cadence)) return alert('Inputs have to be a positive number');
      workout = new Running([lat, lng], distance, duration, cadence);

    }
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
        if (!validInputs(distance, duration, elevation) || !allPositive(distance, duration)) return alert('Inputs have to be a positive number');
        workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    //Add object to the workout array
    this.#workouts.push(workout);
    console.log(workout);
    //Render Marker
    this._renderWorkoutMarker(workout);
    //Clear Input Fields
    inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';
  }
    _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} `
      )
      .openPopup();
  }
}

const app = new App();
