basic.forever(function () {
    serial.writeValue("x", STH30.temperature(STH30.STH30_T_UNIT.C))
    basic.pause(1000)
})
