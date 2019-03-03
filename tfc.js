// Time formatter and calculator v1.0
// Zeus Ruiz && Vincent Gillot

$(function () {

  var digits = "";
  var fps = "";
  var historic = {};

  localStorage.setItem('historic', JSON.stringify(historic));
  // var historic2 = JSON.parse(localStorage.getItem('historic'));

  $('[class^="tfc_d"]').each(function() {

    if (this.id !== "") { // Check if ID is missing

      values($('#' + this.id)); // Ask for digits & fps values

      if (digits === 4 || digits === 6 || digits === 8) { // Check if class is wrong

        // Set first value
        var basicStr = ' ' + '00000000'.substr(0, digits).match(/([0-9]{1,2})/g).join(' : ');
        $('#' + this.id).val(basicStr);

        // Create container for every input history
        var ls_historic = JSON.parse(localStorage.getItem('historic'));
        ls_historic[this.id] = { 0:basicStr };
        localStorage.setItem('historic', JSON.stringify(ls_historic));

      } else {

        $('#' + this.id).prop({'placeholder':'TFC: wrong class','disabled':'true'});
        alert('TFC: input with ID ' + this.id + ' contains an invalid digits value (d' + digits + '). Check class to fix it.');

      }

    } else {

      $(this).prop({'placeholder':'TFC: missing ID','disabled':'true'});
      alert('TFC: one or more inputs has missing IDs. Inputs must have a not specific ID to work.');

    }

  });

	$('[class^="tfc_d"]').focusin(function(e) {
    // console.log('focusin');
    var id = e.target.id;
	  var target = $('#' + id);
    var currentVal = target.val();
    var operation = false;
	 	var operatorSign = "";

    values(target); // Ask for digits & fps values

    var basicStr = ' ' + '00000000'.substr(0, digits).match(/([0-9]{1,2})/g).join(' : ');
    var initialVal = basicStr;
    var pos = target.val().length - 1;
    target.val(format(target.val()));
    setCaret();

    target.click(function(e) { setCaret(); });

	  target.keydown(function(e) {

      var key = e.keyCode || e.charCode;

      var clean = target.val().replace(/\D/g, '');
      var purge = target.val().replace(/\D/g, '').replace(/^0+/, '');

	    if (key >= 48 && key <= 57 || key >= 96 && key <= 105) { // DIGITS
        if (purge.length < clean.length) {
          if (key >= 48 && key <= 57) purge += key - 48;
          if (key >= 96 && key <= 105) purge += key - 96;
  				target.val(format(purge));
        }
	      return false;
	    }

      else if (key === 110 || key === 190) { // DOT
        if (purge.length === clean.length - 1) purge += '0';
				if (purge.length < clean.length - 1) purge += '00';
				target.val(format(purge));
				return false;
	    }

	    else if (key === 107 || key === 109 || key === 187 || key === 189) { // ADD & SUB
        if (operation === false) initialVal = target.val();
				if (key === 107 || key === 187) operatorSign = "+";
				if (key === 109 || key === 189) operatorSign = "-";
        operation = true;
        target.val(format(basicStr));
        return false;
	    }

      else if (key === 13) { // ENTER
        if (e.altKey && digits <= 6) { // ALT + ENTER
          var getHours = (new Date(Date.now()).getHours()).toString();
          var getMinutes = (new Date(Date.now()).getMinutes()).toString();
          var getSeconds = (new Date(Date.now()).getSeconds()).toString();
          if (getHours < 10) getHours = "0" + getHours;
          if (getMinutes < 10) getMinutes = "0" + getMinutes;
          if (getSeconds < 10) getSeconds = "0" + getSeconds;
          var actual_time = getHours + getMinutes + getSeconds;
          target.val(format(actual_time.substr(0, digits)));
        }
        if (operation === true) {
          currentVal = target.val();
          calculator(initialVal, currentVal, operatorSign);
          initialVal = target.val();
        }
        cleanOperator();
        addHistoric(target.val());
        return false;
      }

      else if (key === 37 || key === 39) { // ARROW LEFT & RIGHT
        if (key === 37 && pos > 4) pos = pos - 5;
				if (key === 39 && pos < target.val().length - 4) pos = pos + 5;
        target.val(format(target.val()));
        return false;
      }

      else if (key === 38 || key === 40) { // ARROW UP & DOWN
        var stepVal = target.val();
        if (key === 38) stepSign = "+";
				if (key === 40) stepSign = "-";
        currentVal = basicStr.substr(0, pos) + '1' + basicStr.substr(pos, basicStr.length);
        if (e.shiftKey) currentVal = basicStr.substr(0, pos - 1) + '10' + basicStr.substr(pos, basicStr.length);
        calculator(stepVal, currentVal, stepSign);
        return false;
      }

      else if (key === 8) { // BACKSPACE
        target.val(format(clean.substr(0, clean.length - 1)));
        return false;
      }

      else if (key === 46) { // SUPR
        initialVal = basicStr;
        addHistoric(target.val());
        target.val(format(basicStr));
        return false;
      }

    	else if (key === 27 && operation === true) { // ESC
    		target.val(format(initialVal));
        cleanOperator();
        return false;
    	}

      else if (key === 90) { // CTRL + Z
        if (e.ctrlKey) backHistoric();
        return false;
      }

    	else if (key === 9) { // TAB
        // Just to keep default behaviour
      }

      else { // Lock any other key not listed above
        return false;
      }

      setCaret();

	  });

	  target.focusout(function(e) {
      // console.log('focusout');
      // Unbind
      target.unbind('keydown');
      target.unbind('click');

      // Chop, check and reassemble
	    var matches = target.val().replace(/\D/g, '').match(/([0-9]{1,2})/g);
      if (digits >= 4 && matches[1] > 59) matches[1] = 59; // minutes
      if (digits >= 6 && matches[2] > 59) matches[2] = 59; // seconds
      if (digits >= 8 && matches[3] > fps - 1) matches[3] = fps - 1; // frames
      target.val(' ' + matches.join(' : '));

      // Final checks
      if (operation === true) target.val(initialVal);
      cleanOperator();

      // Add historic
      addHistoric(target.val());

      // Unbind
      target.unbind('focusout');
	  });

    function format(str) {
      // console.log('format');

      var clean = target.val().replace(/\D/g, '');

      // Add zeros to the left & semicolon
      var zeroes = '';
      for (var i = 0; i < clean.length - str.length; i++) zeroes += '0';
      str = (zeroes + str).match(/([0-9]{1,2})/g).join(' : ');

      // Set position brakets
      str = ' ' + [str.slice(0, pos - 2), '[', str.slice(pos - 2, pos), ']', str.slice(pos)].join('');
      str = str.replace(' [', '[').replace('] ', ']');

      // Add operator
      if (operation === true) str = operatorSign + str;

      return str;
    }

    function setCaret() {
      // console.log('setCaret');
      const input = document.getElementById(id);
      input.focus();
      input.setSelectionRange(target.val().length, target.val().length);
    }

		function calculator(pre, post, sign) {
      // console.log('calculator');

      // Clean, Chop & Transform time
      var pretime = pre.replace(/\D/g, '').match(/([0-9]{0,2})/g);
      console.log(pretime);
      if (digits === 4) var totalpre = (pretime[0] * 3600 * fps) + (pretime[1] * 60 * fps);
      if (digits === 6) var totalpre = (pretime[0] * 3600 * fps) + (pretime[1] * 60 * fps) + (pretime[2] * fps);
      if (digits === 8) var totalpre = (pretime[0] * 3600 * fps) + (pretime[1] * 60 * fps) + (pretime[2] * fps) + (+pretime[3]);

      var posttime = post.replace(/\D/g, '').match(/([0-9]{0,2})/g);
      if (digits === 4) var totalpost = (posttime[0] * 3600 * fps) + (posttime[1] * 60 * fps);
      if (digits === 6) var totalpost = (posttime[0] * 3600 * fps) + (posttime[1] * 60 * fps) + (posttime[2] * fps);
      if (digits === 8) var totalpost = (posttime[0] * 3600 * fps) + (posttime[1] * 60 * fps) + (posttime[2] * fps) + (+posttime[3]);

			// Choose operator
			if (sign === "+") var totalcalc = totalpre + totalpost;
			if (sign === "-") var totalcalc = totalpre - totalpost;
			if (totalcalc < 0) totalcalc = 0;

			// Transform time back
      var totalhrs = (Math.floor(totalcalc/(3600 * fps))).toString();
      if (digits >= 4) var totalmin = ((Math.floor(totalcalc/(60 * fps))) % 60).toString();
      if (digits >= 6) var totalsec = ((Math.floor(totalcalc/fps)) % 60).toString();
      if (digits >= 8) var totalfps = (totalcalc % fps).toString();

			// Some Checks
      if (totalhrs > 99) totalhrs = 99;
      if (digits >= 4 && totalmin < 10) totalmin = "0" + totalmin;
      if (digits >= 6 && totalsec < 10) totalsec = "0" + totalsec;
      if (digits >= 8 && totalfps < 10) totalfps = "0" + totalfps;

      // Assemble string
      if (digits === 4) target.val(format(totalhrs + totalmin));
      if (digits === 6) target.val(format(totalhrs + totalmin + totalsec));
      if (digits === 8) target.val(format(totalhrs + totalmin + totalsec + totalfps));
		}

    function cleanOperator() { // Remove operator
      // console.log('cleanOperator');
      operation = false;
      operatorSign = "";
      target.val(target.val().replace('+', '').replace('-', ''));
    }

    function addHistoric(str) { // Add value to history
      // console.log('addHistoric');
      var clean = str.replace(/\D/g, '');
      var getHistoric = JSON.parse(localStorage.getItem('historic'));
      var currentHisto = getHistoric[id];
      var lastHisto = currentHisto[Object.keys(currentHisto)[Object.keys(currentHisto).length - 1]];
      if (clean !== lastHisto) {
        getHistoric[id][Date.now()] = clean;
        localStorage.setItem('historic',JSON.stringify(getHistoric));
      }
    }

    function backHistoric() { // Get previous value
      // console.log('backHistoric');
      var getHistoric = JSON.parse(localStorage.getItem('historic'));
      var currentHisto = getHistoric[id];
      if(Object.keys(currentHisto).length > 1){
        delete currentHisto[Object.keys(currentHisto)[Object.keys(currentHisto).length - 1]];
        getHistoric[id] = currentHisto;
        localStorage.setItem('historic',JSON.stringify(getHistoric));
        target.val(format(currentHisto[Object.keys(currentHisto)[Object.keys(currentHisto).length - 1]]));
      }
    }
	});

  function values(target) { // Set digits & fps values
    // console.log('values');
    digits = parseInt(target.prop("class").split("tfc_d").pop().split(" ").shift());
    if (!$.isNumeric(digits)) digits = 1;
    if (digits === 8) fps = target.prop("class").split("tfc_d8_f").pop().split(" ").shift();
    if (digits !== 8 || !$.isNumeric(fps)) fps = 1;
    console.log("tfc --> digits = " + digits);
    console.log("tfc --> fps = " + fps);
  }

});
