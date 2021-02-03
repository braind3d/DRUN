import {Validator, Location, PaymentCard} from '../../@types/global';

/**
 * Validator entity, providing the means for testing passed identifier,
 * location and payment data.
 *
 * @export
 * @param {{uuidValidate: Function, moment: Function}} {
 *   uuidValidate,
 *   moment
 * } - dependency injection
 * @return {object}
 */
export default function buildValidator({
  uuidValidate,
  moment,
}: {uuidValidate: Function, moment: Function}): Validator {
  /**
   * Validates whether an id string is in a valid format or not.
   *
   * @param {string} identifier
   */
  function validateIdentifier(identifier: string): void {
    if (!identifier) {
      throw new Error('Identifier not defined.');
    }

    if (!uuidValidate(identifier)) {
      throw new Error('Identifier passed is invalid.');
    }
  }

  /**
   * Validates whether a location object is in a valid format or not.
   *
   * @param {Location} location - location object to be verified
   */
  function validateLocation(location: Location): void {
    if (!location) {
      throw new Error('Location not defined.');
    }

    if (!location.latitude) {
      throw new Error('Location must have a latitude defined.');
    }

    if (!location.longitude) {
      throw new Error('Location must have a longitude defined.');
    }

    if (Number.isNaN(Number(location.latitude))) {
      throw new Error('Location latitude must be a number.');
    }

    if (Number.isNaN(Number(location.longitude))) {
      throw new Error('Location longitude must be a number.');
    }

    if (location.latitude < -90.0 || location.latitude > 90.0) {
      throw new Error('Latitude must be between -90 and 90.');
    }

    if (location.longitude < -180.0 || location.longitude > 180.0) {
      throw new Error('Longitude must be between -180 and 180.');
    }
  }


  /**
   * Validates whether a route can be completed by a drone.
   *
   * @param {Location} homeLocation
   * @param {Location} senderLocation
   * @param {Location} receiverLocation
   * @param {number} maxDistance
   * @return {number} - total route distance in kilometers
   */
  function validateRoute(
      homeLocation: Location,
      senderLocation: Location,
      receiverLocation: Location,
      maxDistance: number,
  ): number {
    // Home location validation
    try {
      validateLocation(homeLocation);
    } catch (e) {
      throw new Error('Home location error: ' + e.message);
    }

    // Sender location validation
    try {
      validateLocation(senderLocation);
    } catch (e) {
      throw new Error('Sender location error: ' + e.message);
    }

    // Receiver location validation
    try {
      validateLocation(receiverLocation);
    } catch (e) {
      throw new Error('Receiver location error: ' + e.message);
    }

    // Calculating total distance of flight
    let totalDistance;
    totalDistance = calculateDistance(homeLocation, senderLocation);
    totalDistance += calculateDistance(senderLocation, receiverLocation);
    totalDistance += calculateDistance(receiverLocation, homeLocation);

    // Flight distance validation
    if (totalDistance > maxDistance) {
      throw new Error('Flight distance too long.');
    }

    return totalDistance;

    /**
     * Calculates distance in kilometers between two geographical points using
     * the Haversine formula.
     *
     * Reference: https://en.wikipedia.org/wiki/Haversine_formula
     *
     * @param {Location} locationA
     * @param {Location} locationB
     * @return {number} - distance between the locations in kilometers
     */
    function calculateDistance(
        locationA: Location,
        locationB: Location,
    ): number {
      const R = 6371; // 1 kilometer
      const toRad = (value: number) => value * Math.PI / 180;

      const dLatitude = toRad(locationB.latitude - locationA.latitude);
      const dLongitude = toRad(locationB.longitude - locationA.longitude);
      const LatitudeA = toRad(locationA.latitude);
      const LatitudeB = toRad(locationB.latitude);

      const a = Math.pow(Math.sin(dLatitude / 2), 2) +
        Math.pow(Math.sin(dLongitude / 2), 2) *
        Math.cos(LatitudeA) * Math.cos(LatitudeB);

      let result = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      result *= R;

      return result;
    }
  }

  /**
   * Validates whether a paymentCard object is in a valid format or not.
   *
   * @param {PaymentCard} paymentCard
   */
  function validatePaymentCard(paymentCard: PaymentCard): void {
    if (!paymentCard) {
      throw new Error('Card not defined.');
    }

    if (!paymentCard.number) {
      throw new Error('Card must have a number defined.');
    }

    if (!paymentCard.date) {
      throw new Error('Card must have a date defined.');
    }

    if (!paymentCard.cvc) {
      throw new Error('Card must have a cvc defined.');
    }

    if (!paymentCard.number.match(/^[0-9 ]+$/)) {
      throw new Error('Card number can only have numbers.');
    }

    if (paymentCard.number.replace(/ /g, '').length !== 16) {
      throw new Error('Card number must contain 16 digits.');
    }

    if (!moment(paymentCard.date, 'MM/YY', true).isValid()) {
      throw new Error('Card date must be in MM/YY format.');
    }

    if (moment(paymentCard.date, 'MM/YY', true).diff(moment()) < 0) {
      throw new Error('Card date must not have expired.');
    }

    if (!paymentCard.cvc.match(/^[0-9]+$/)) {
      throw new Error('Card cvc can only contain numbers.');
    }

    if (paymentCard.cvc.length !== 3) {
      throw new Error('Card cvc must contain 3 digits.');
    }
  }

  // Module exporting
  return Object.freeze({
    validateIdentifier: validateIdentifier,
    validateLocation: validateLocation,
    validateRoute: validateRoute,
    validatePaymentCard: validatePaymentCard,
  });
}