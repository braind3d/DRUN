import {default as val} from '.';

describe('validator.validateIdentifier', () => {
  it('must find undefined identifier', () => {
    expect(() => val.validateIdentifier(null, 'internal'))
        .toThrow('Identifier not defined.');
  });

  it('must find invalid type', () => {
    expect(
        () => val.validateIdentifier('ckhqosj1s0000eaoyblr71uuc', 'missing'),
    ).toThrow('Identifier type defined is invalid.');
  });

  it('must find invalid internal identifier', () => {
    expect(
        () => val.validateIdentifier('sthinvalid88', 'internal'),
    ).toThrow('Identifier passed is invalid.');
  });

  it('must find invalid firebase identifier', () => {
    expect(
        () => val.validateIdentifier('@@@LOe8s@XfrJLoROHI1FZ52r4s', 'firebase'),
    ).toThrow('Identifier passed is invalid.');
  });
});

describe('validator.paymentCard', () => {
  it('must find undefined card', () => {
    expect(() => val.validatePaymentCard(null)).toThrow('Card not defined.');
  });

  it('must find undefined card number', () => {
    expect(() => val.validatePaymentCard(
        {number: null, date: '12/68', CVC: '666'},
    )).toThrow('Card must have a number defined.');
  });

  it('must find undefined card date', () => {
    expect(() => val.validatePaymentCard(
        {number: '4242 4242 4242 4242', date: null, CVC: '666'},
    )).toThrow('Card must have a date defined.');
  });

  it('must find undefined card CVC', () => {
    expect(() => val.validatePaymentCard(
        {number: '4242 4242 4242 4242', date: '12/68', CVC: null},
    )).toThrow('Card must have a CVC defined.');
  });

  it('must find invalid card number (containing non-digits)', () => {
    expect(() => val.validatePaymentCard(
        {number: '4242 4242 4242 424a', date: '12/68', CVC: '666'},
    )).toThrow('Card number can only have numbers.');
  });

  it('must find invalid card number (not 16 digits)', () => {
    expect(() => val.validatePaymentCard(
        {number: '4242 4242 4242 424', date: '12/68', CVC: '666'},
    )).toThrow('Card number must contain 16 digits.');
  });

  it('must find invalid card date (format)', () => {
    expect(() => val.validatePaymentCard(
        {number: '4242 4242 4242 4242', date: '13/68', CVC: '666'},
    )).toThrow('Card date must be in MM/YY format.');
  });

  it('must find invalid card date (expired)', () => {
    expect(() => val.validatePaymentCard(
        {number: '4242 4242 4242 4242', date: '12/18', CVC: '666'},
    )).toThrow('Card date must not have expired.');
  });

  it('must find invalid card CVC (containing non-digits)', () => {
    expect(() => val.validatePaymentCard(
        {number: '4242 4242 4242 4242', date: '12/68', CVC: '69a'},
    )).toThrow('Card CVC can only contain numbers.');
  });

  it('must find invalid card CVC (not 3 digits)', () => {
    expect(() => val.validatePaymentCard(
        {number: '4242 4242 4242 4242', date: '12/68', CVC: '6969'},
    )).toThrow('Card CVC must contain 3 digits.');
  });
});
