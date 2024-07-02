export default function toEvenLengthHexString(
  hexDigitsOrNumber: number | string
): `0x${string}` {
  const hexDigits =
    typeof hexDigitsOrNumber === 'string'
      ? hexDigitsOrNumber
      : hexDigitsOrNumber.toString(16);

  return hexDigits.length % 2 === 0 ? `0x${hexDigits}` : `0x0${hexDigits}`;
}
