/* global google */
import React, { Component } from "react";
import { connect } from "react-redux";
import { Segment, Form, Button, Grid, Header } from "semantic-ui-react";
import { createEvent, updateEvent } from "../eventActions";
import { reduxForm, Field } from "redux-form";
import Script from "react-load-script";
import { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import {
  composeValidators,
  combineValidators,
  isRequired,
  hasLengthGreaterThan
} from "revalidate";
import TextInput from "../../../app/common/form/TextInput";
import TextArea from "../../../app/common/form/TextArea";
import SelectInput from "../../../app/common/form/SelectInput";
import DateInput from "../../../app/common/form/DateInput";
import PlaceInput from "../../../app/common/form/PlaceInput";
import cuid from "cuid";

const mapState = (state, ownProps) => {
  const eventId = ownProps.match.params.id;

  let event = {};

  if (eventId && state.events.length > 0) {
    event = state.events.filter(event => eventId === event.id)[0];
  }

  return { initialValues: event };
};

const actions = {
  createEvent,
  updateEvent
};

const category = [
  { key: "drinks", text: "Drinks", value: "drinks" },
  { key: "culture", text: "Culture", value: "culture" },
  { key: "film", text: "Film", value: "film" },
  { key: "food", text: "Food", value: "food" },
  { key: "music", text: "Music", value: "music" },
  { key: "travel", text: "Travel", value: "travel" }
];

const validate = combineValidators({
  title: isRequired({ message: "The event title is required" }),
  category: isRequired({ message: "The event category is required" }),
  description: composeValidators(
    isRequired({ message: "The event description is required" }),
    hasLengthGreaterThan(4)({
      message: "The event description must be atleast 5 char long"
    })
  )(),
  city: isRequired({ message: "The event city is required" }),
  venue: isRequired({ message: "The event venue is required" })
});

class EventForm extends Component {
  state = {
    cityLatLng: {},
    venueLatLng: {},
    scriptLoaded: false
  };

  handleCitySelect = selectedCity => {
    geocodeByAddress(selectedCity)
      .then(results => getLatLng(results[0]))
      .then(latLng => {
        this.setState({ cityLatLng: latLng });
      })
      .then(() => {
        this.props.change("city", selectedCity);
      });
  };

  handleVenueSelect = selectedVenue => {
    geocodeByAddress(selectedVenue)
      .then(results => getLatLng(results[0]))
      .then(latLng => {
        this.setState({ venueLatLng: latLng });
      })
      .then(() => {
        this.props.change("venue", selectedVenue);
      });
  };

  handleScriptLoad = () => {
    this.setState({ scriptLoaded: true });
  };

  onFormSubmit = values => {
    values.venueLatLng = this.state.venueLatLng;
    if (this.props.initialValues.id) {
      this.props.updateEvent(values);
      this.props.history.goBack();
    } else {
      const newEvent = {
        ...values,
        id: cuid(),
        hostPhotoURL: "/assets/user.png",
        hostedBy: "Bok"
      };
      this.props.createEvent(newEvent);
      this.props.history.push("/events");
    }
  };

  render() {
    const { invalid, submitting, pristine } = this.props;

    return (
      <Grid>
        <Script
          url="https://maps.googleapis.com/maps/api/js?key=AIzaSyANzDUCXYaps8mgGsjtfeXyZMCgSAg1G1k&libraries=places"
          onLoad={this.handleScriptLoad}
        />
        <Grid.Column width={10}>
          <Segment>
            <Form onSubmit={this.props.handleSubmit(this.onFormSubmit)}>
              <Field
                name="title"
                type="text"
                component={TextInput}
                placeholder="Event title"
              />
              <Field
                name="category"
                type="text"
                component={SelectInput}
                placeholder="Event title"
                options={category}
              />
              <Field
                name="description"
                type="text"
                component={TextArea}
                rows={3}
                placeholder="Event title"
              />
              <Field
                name="city"
                type="text"
                component={PlaceInput}
                onSelect={this.handleCitySelect}
                options={{ types: ["(cities)"] }}
                placeholder="Event title"
              />
              {this.state.scriptLoaded && (
                <Field
                  name="venue"
                  type="text"
                  component={PlaceInput}
                  onSelect={this.handleVenueSelect}
                  options={{
                    // location: new google.maps.LatLng(this.state.cityLatLng),
                    types: ["establishment"]
                  }}
                  placeholder="Event title"
                />
              )}
              <Field
                name="date"
                type="text"
                component={DateInput}
                dateFormat="YYYY/MM/DD HH:mm"
                timeFormat="HH:mm"
                showTimeSelected
                placeholder="Event title"
              />
              <Button
                disabled={invalid || submitting || pristine}
                positive
                type="submit"
              >
                Submit
              </Button>
              <Button onClick={this.props.history.goBack} type="button">
                Cancel
              </Button>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    );
  }
}

export default connect(
  mapState,
  actions
)(
  reduxForm({ form: "eventForm", enableReinitialize: true, validate })(
    EventForm
  )
);
