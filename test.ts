basic.forever(function () {
    serial.writeValue("x", STTS751.temperature(STTS751.STTS751_T_UNIT.C))
    basic.pause(1000)
})