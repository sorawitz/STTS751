/**
* ST STTS751 temperature Sensor I2C extension for makecode.
* From microbit/micropython Chinese community.
* https://github.com/makecode-extensions
*/

/**
 * ST STTS751 temperature Sensor I2C extension
 */
//% weight=100 color=#4090e0 icon="\uf2c7" block="STTS751" 
namespace STTS751 {
    export enum STTS751_T_UNIT {
        //% block="C"
        C = 0,
        //% block="F"
        F = 1
    }

    export enum STTS751_RESOLUTION {
        //% block="9 bit"
        BIT9 = 9,
        //% block="10 bit"
        BIT10 = 10,
        //% block="11 bit"
        BIT11 = 11,
        //% block="12 bit"
        BIT12 = 12
    }

    const _STTS751_RESOLUTION = [8, 0, 4, 12]
    const STTS751_I2C_ADDR = 0x4A
    const STTS751_REG_STATUS = 1
    const STTS751_REG_CONFIG = 3
    const STTS751_REG_CONRAT = 4
    const STTS751_REG_TEMPVH = 0
    const STTS751_REG_TEMPVL = 2
    const STTS751_REG_ONESHOT = 15

    let _oneshot = false
    oneshot_mode(false)

    // set dat to reg
    function setreg(reg: number, dat: number): void {
        let tb = pins.createBuffer(2)
        tb[0] = reg
        tb[1] = dat
        pins.i2cWriteBuffer(STTS751_I2C_ADDR, tb)
    }

    // read a Int8LE from reg
    function getInt8LE(reg: number): number {
        pins.i2cWriteNumber(STTS751_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(STTS751_I2C_ADDR, NumberFormat.Int8LE);
    }

    // read a UInt8LE from reg
    function getUInt8LE(reg: number): number {
        pins.i2cWriteNumber(STTS751_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(STTS751_I2C_ADDR, NumberFormat.UInt8LE);
    }

    // set a mask dat to reg
    function setreg_mask(reg: number, dat: number, mask: number): void {
        setreg(reg, (getUInt8LE(reg) & mask) | dat)
    }

    // turn number to int16
    function int16(n: number): number {
        return (n > 0x7fff) ? n - 65536 : n
    }

    // oneshot mode handle
    function ONE_SHOT(): void {
        if (_oneshot) {
            setreg(STTS751_REG_ONESHOT, 1)
            while (true) {
                if (getUInt8LE(STTS751_REG_STATUS) < 0x80) return
            }
        }
    }

    /**
     * set oneshot mode to reduce power consumption
     */
    //% block="oneshot mode %oneshot"
    export function oneshot_mode(oneshot: boolean = false) {
        _oneshot = oneshot
        let t = (oneshot) ? 0x40 : 0x00
        setreg_mask(STTS751_REG_CONFIG, t, 0xBF)
    }

    /**
     * set temperature sensor resolution
     */
    //% block="resolution %res"
    //% res.defl=STTS751.STTS751_RESOLUTION.BIT12
    export function resolution(res: STTS751.STTS751_RESOLUTION = STTS751.STTS751_RESOLUTION.BIT12) {
        if ((res < 9) || (res > 12)) return
        setreg_mask(STTS751_REG_CONFIG, _STTS751_RESOLUTION[res - 9], 0xF3)
    }

    /**
     * get temperature
     */
    //% block="temperature %u"
    export function temperature(u: STTS751.STTS751_T_UNIT = STTS751.STTS751_T_UNIT.C): number {
        ONE_SHOT()
        let T = int16(getUInt8LE(STTS751_REG_TEMPVH) * 256 + getUInt8LE(STTS751_REG_TEMPVL)) / 256
        if (u == STTS751.STTS751_T_UNIT.F) T = 32 + T * 9 / 5
        return T
    }

}
