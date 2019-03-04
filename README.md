Requieres JQuery in order to work.

# Time formatter & calculator
    Time formatter & calculator auto-formats time values in an input field.
    Formats according to pairs of digits separated by colons pattern.
    It allows to use this input as a calculator.

# Getting started
    TFC can manages time format and calculation of different time fractions from hours to frames per second.
    Starting from hours you can choose the last time fraction you want to include.
    You can declare this with an even amount of digits from 4 to 8.
    Just need an input with an unespecific ID and a tfc class that works as follows: tfc_digits_fps
        To decalre digits: d + digits amount
        To decalre fps: f + fps amount
        
# Examples
    tfc_d4
    tfc_d6
    tfc_d8_f25
    tfc_d8_f30

# Instructions:
    ADD & SUBSTRACT: select operator.
    ENTER: execute operation.
    ESC: cancel operation and get back to current value .
    ARROW LEFT & RIGHT: select pair of digits.
    ARROW UP & DOWN: ± 1 unit.
    SHIFT + UP & DOWN: ± 10 units.
    BACKSPACE: remove last digit.
    SUPR: set current and initial value to 00.
    ALT + ENTER: set value to current time (only 4 or 6 digits).
    CTRL + Z: go back to previous values. Deletes actual value.
