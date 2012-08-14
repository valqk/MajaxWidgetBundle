(function($) {
    $.widget('ui.majaxdatetimeselector', {
        version: '1.0.0',
        eventPrefix: 'majax.datetimeselector',
        options: {
            date_can_be_empty: false,
            time_can_be_empty: false,
            display_date: true,
            display_time: true,
            seconds: false,
            time_format_24h: true,
            time_is_input: true,
            dateFormat: 'dd.mm.yy',
            datepicker_opts: {
            }

        },
        _create: function() {
            this.options['id'] = $(this.element).attr('id');
            if (this.options.dateFormat != '') {
                this.options.datepicker_opts.dateFormat = this.options.dateFormat;
            }
            this._hide_real_ctrls();
            this._build_facade();
            return this;
        },
        _build_facade: function() {
            this.options['controls'] = $('<div id="'+this.options['id']+'"></div>');
            $(this.element).append(this.options['controls']);

            if (this.options['display_date'])
            {
                this.options['date'] = $('<input size="10" type="text" id="'+this.options['id']+'_display" />');
            }
            if (this.options['display_time'])
            {
                if (this.options['time_is_input'] === true) {
                    // time is entered in input. we create input field with prefilled string enter:time and when user starts typing we validate.
                    this.options['time_display'] = $('<input size="5" type="text" id="'+this.options['id']+'_time_display"/>');
                    var default_time_val = 'HH:MM';
                    if (this.options['seconds']) {
                        default_time_val + ':SS';
                    }
                    this.options['time_display'].val(default_time_val);
                    var oThis = this;
                    // bind events to time input
                    this.options['time_display'].keydown(function() { oThis._lastInputVal = $(this).val(); });
                    this.options['time_display'].keyup(function() { oThis._parseInputTime($(this)); });
                    this.options['time_display'].focus(function() { $(this).select() });
                    this.options['time_display'].mouseup(function(e){ e.preventDefault(); });
                    //this.options['time_display'].blur(function(e){ console.log('SETNI GO BE!'); oThis._update_ctrls() });
                    this.options['time_display'].change(function(e){ oThis._update_ctrls() });

                } else {
                    this.options['hours'] = $('<select id="'+this.options['id']+'_hours"></select>');
                    if (this.options['time_can_be_empty'])
                        this.options['hours'].append('<option value=""></option>');
                    for(var i = 1; i < 13; i++)
                        this.options['hours'].append('<option value="'+i+'">'+i+'</option>');

                    this.options['minutes'] = $('<select id="'+this.options['id']+'_minutes"></select>');
                    if (this.options['time_can_be_empty'])
                        this.options['minutes'].append('<option value=""></option>');
                    for(var i = 0; i < 60; i++)
                        this.options['minutes'].append('<option value="'+i+'">'+this._zero_pad(i, 2)+'</option>');

                    if (this.options['seconds'])
                    {
                        this.options['seconds'] = $('<select id="'+this.options['id']+'_seconds"></select>');
                        if (this.options['time_can_be_empty'])
                            this.options['seconds'].append('<option value=""></option>');
                        for(var i = 0; i < 60; i++)
                            this.options['seconds'].append('<option value="'+i+'">'+this._zero_pad(i, 2)+'</option>');
                    }

                    this.options['ampm'] = $('<select id="'+this.options['id']+'_ampm"></select>');
                    if (this.options['time_can_be_empty'])
                        this.options['ampm'].append('<option value=""></option>');
                    this.options['ampm'].append('<option value="am">am</option>');
                    this.options['ampm'].append('<option value="pm">pm</option>');
                }
            }


            var tfDisplayUpdate = function(widget) {
                return function() {
                    widget._update_ctrls();
                }
            }

            this._ctrls_to_display();


            if (this.options['display_date'])
            {
                this.options['date'].change(tfDisplayUpdate(this));
                this.options['date'].datepicker(this.options['datepicker_opts']);
                this.options['controls'].append(this.options['date']);
            }

            if (this.options['display_date'] && this.options['display_time'])
                this.options['controls'].append(' ');

            if (this.options['display_time'])
            {
                if (this.options['time_is_input'] === true) {
                    this.options['controls'].append(this.options['time_display']);
                } else {
                    this.options['hours'].change(tfDisplayUpdate(this));
                    this.options['minutes'].change(tfDisplayUpdate(this));
                    if (this.options['seconds'])
                        this.options['seconds'].change(tfDisplayUpdate(this));
                    this.options['ampm'].change(tfDisplayUpdate(this));

                    this.options['controls'].append(this.options['hours']);
                    this.options['controls'].append(':');
                    this.options['controls'].append(this.options['minutes']);
                    if (this.options['seconds'])
                    {
                        this.options['controls'].append(':');
                        this.options['controls'].append(this.options['seconds']);
                    }
                    this.options['controls'].append(' ');
                    this.options['controls'].append(this.options['ampm']);
                }
            }

            if (this.options['date_can_be_empty'] || this.options['time_can_be_empty'])
            {
                this.options['controls'].append(' <input type="button" id="'+this.options['id']+'_empty" value="Clear" />');
                $('#'+this.options['id']+'_empty').button();
                var tfClear = function(widget) {
                    return function() {
                        widget._clear_display();
                        return false;
                    }
                }
                $('#'+this.options['id']+'_empty').click(tfClear(this));
            }
        },
        _zero_pad: function(num,count)
        {
            var numZeropad = num + '';
            while(numZeropad.length < count) {
                numZeropad = "0" + numZeropad;
            }
            return numZeropad;
        },
        _ctrls_to_display: function() {
            if (this.options['display_date'])
            {
                var m, d, y;
                m = $('#'+this.options['id']+'_date_month').val();
                d = $('#'+this.options['id']+'_date_day').val();
                y = $('#'+this.options['id']+'_date_year').val();
                if (parseInt(m, 10) > 0 && parseInt(d, 10) > 0 && parseInt(y, 10) > 0)
                {
                    this.options['date'].val($.datepicker.formatDate(this.options['dateFormat'], new Date(m+'/'+d+'/'+y)));
                }
            }

            if (this.options['display_time'])
            {
                var ctrlsTime = this._parseCtrlsTime();
                this._ctrlsTime = ctrlsTime;
                //set the input
//                console.log('set', "$('#"+this.options['id']+"_time_display')", ctrlsTime);
                if (this.options['time_is_input'] === true) {
                    var timeStr = ctrlsTime.hours+':'+ctrlsTime.minutes;
                    if (ctrlsTime.seconds > 0) {
                        timeStr += ':' + ctrlsTime.seconds;
                    }
                    if (this.options['time_format_24h'] === false) {
                        timeStr += ' ' + ctrlsTime.ampm;
                    }
                    this.options['time_display'].val(timeStr);
                } else {
                    this.options['hours'].val(ctrlsTime.hours);
                    this.options['minutes'].val(ctrlsTime.minutes);
                    if (ctrlsTime.seconds > 0) {
                        this.options['seconds'].val(ctrlsTime.seconds);
                    }
                    this.options['ampm'].val(ctrlsTime.ampm);
                }
            }
        },
        _parseCtrlsTime: function () {
            var hrs = 'HH';
            var mins = 'mm';
            var secs = false;
            var ampm = false;
            if (this.options['time_is_input'] === true) {
                var timeStr = '';
                var hrs = parseInt($('#'+this.options['id']+'_time_hour').val(), 10);
                if (hrs == NaN) {
                    hrs = 'HH';
                }
                var mins = parseInt($('#'+this.options['id']+'_time_minute').val(), 10);
                if (mins == NaN) {
                    mins = 'mm';
                }

                var ampm = false;
                if (this.options['time_format_24h'] !== true) {
                    if (hrs < 12)
                        ampm = 'am';
                    if (hrs >= 12)
                    {
                        ampm = 'pm';
                        if (hrs > 12)
                            hrs = hrs - 12;
                    }
                    if (hrs == 0)
                    {
                        hrs = 12;
                    }
                }
                if (this.options['seconds'] && $('#'+this.options['id']+'_time_second').val() != '')
                {
                    var secs = parseInt($('#'+this.options['id']+'_time_second').val());
                }
            } else {
                var hrs = $('#'+this.options['id']+'_time_hour').val();
                if (hrs != '')
                {
                    hrs = parseInt(hrs, 10);
                    if (hrs < 12)
                        ampm = 'am';
                    if (hrs >= 12)
                    {
                        ampm = 'pm';
                        if (hrs > 12)
                            hrs = hrs - 12;
                    }
                    if (hrs == 0)
                    {
                        hrs = 12;
                    }

                }

                var mins = parseInt($('#'+this.options['id']+'_time_minute').val());
                if (mins == NaN) mins = 'mm';


                if (this.options['seconds'] && $('#'+this.options['id']+'_time_second').val() != '')
                {
                    seconds = parseInt($('#'+this.options['id']+'_time_second').val(), 10);
                }
            }
            mins = this._zero_pad(mins, 2);
            hrs = this._zero_pad(hrs, 2);
            if (this.options['seconds']) seconds = this._zero_pad(seconds,2);

            return { hours: hrs, minutes: mins, seconds: secs, ampm: ampm };
        },
        _clear_display: function() {
            if (this.options['display_date'] && this.options['date_can_be_empty'])
            {
                $('#'+this.options['id']+'_display').val('');
                $('#'+this.options['id']+'_date_month').val('');
                $('#'+this.options['id']+'_date_day').val('');
                $('#'+this.options['id']+'_date_year').val('');
            }
            if (this.options['display_time'] && this.options['time_can_be_empty'])
            {
                if (this.options['time_is_input']) {
                    this.options['time_display'].val('');
                } else {
                    this.options['hours'].val('');
                    this.options['minutes'].val('');
                    if (this.options['seconds'])
                        this.options['seconds'].val('');
                    this.options['ampm'].val('');
                }
            }

            this._update_ctrls();
        },
        _update_ctrls: function() {
            if (this.options['display_date'])
            {
                var val = this.options['date'].val();
                var vals = val.split('/');
                var sDate = new Date(Date.fromString(val, { order: 'DMY' }));
                if ((val == '' || vals.length != 3) && this.options['date_can_be_empty'])
                {
                    $('#'+this.options['id']+'_date_month').val('');
                    $('#'+this.options['id']+'_date_day').val('');
                    $('#'+this.options['id']+'_date_year').val('');
                }

                var m, d, y;
                m = sDate.getMonth()+1;//vals[0];
                d = sDate.getDate();//vals[1];
                y = sDate.getFullYear();//vals[2];


                if (parseInt(m, 10) > 0 && parseInt(d, 10) > 0 && parseInt(y, 10) > 0)
                {
                    $('#'+this.options['id']+'_date_month').val(parseInt(m, 10));
                    $('#'+this.options['id']+'_date_day').val(parseInt(d, 10));
                    $('#'+this.options['id']+'_date_year').val(parseInt(y, 10));
                }
            }


            if (this.options['display_time'])
            {
                if (this.options['time_format_24h'] === false)
                    var ampm = this.options['ampm'].val();

                var hrs, mins, secs;
                if (this.options['time_is_input'] === true) {
                    var ts = this.options['time_display'].val();
                    if (ts.indexOf(':') == ts.lastIndexOf(':')) {
                        // no secs
                        var pos = ts.indexOf(':');
                        hrs = ts.substring(0, pos);
                        mins = ts.substring(pos+1);
                    } else {
                        // secs
                        var pos = ts.indexOf(':');
                        var lpos = ts.lastIndexOf(':');
                        hrs = ts.substr(0, pos);
                        mins = ts.substring(pos+1, lpos);
                        secs = ts.substring(lpos+1);
                    }
                } else {
                    if (ampm == 'am')
                        hrs = 0;
                    else
                        hrs = 12;
                    hrs += parseInt(this.options['hours'].val(), 10);
                    if (hrs == 12)
                        hrs = 0;
                    if (hrs == 24)
                        hrs = 12;
                    mins = parseInt(this.options['minutes'].val(), 10);
                    if (this.options['seconds'])
                        secs = parseInt(this.options['seconds'].val(), 10);
                }
                    if (this.options['time_can_be_empty']) {
                      if (
                          (this.options['time_is_input'] === false && this.options['ampm'].val() == '' && this.options['hours'].val() == '')
                          || (this.options['time_is_input'] === true && this.options['time_display'].val() == '')) {

                        $('#'+this.options['id']+'_time_hour').val('');
                        $('#'+this.options['id']+'_time_minute').val('');
                        if (this.options['seconds'])
                            $('#'+this.options['id']+'_time_second').val('');
                      }
                    } else {
                            //this.options['time_display'].val(hrs+':'+mins+(this.options['seconds']?secs:''));
                            $('#'+this.options['id']+'_time_hour').val(parseInt(hrs));
                            $('#'+this.options['id']+'_time_minute').val(parseInt(mins));
                            if (this.options['seconds'])
                                $('#'+this.options['id']+'_time_second').val(parseInt(secs));
                    }
            }
        },
        _hide_real_ctrls: function() {
            if (this.options['display_date'])
                $('#'+this.options['id']+'_date').css('display', 'none');
            if (this.options['display_time'])
                $('#'+this.options['id']+'_time').css('display', 'none');
        },
        _show_real_ctrls: function() {
            if (this.options['display_date'])
                $('#'+this.options['id']+'_date').css('display', null);
            if (this.options['display_time'])
                $('#'+this.options['id']+'_time').css('display', null);
        },
        destroy: function() {
            this._show_real_ctrls();
            $('#'+this.options['id']).detach();
            $.Widget.prototype.destroy.call(this);
            return this;
        },
        _parseInputTime: function(el) {
            if (this.options['time_format_24h'] === true && this.options['seconds'] === false) {
                var maxlen = 6;
            }
            if (this.options['time_format_24h'] === true && this.options['seconds'] !== false) {
                var maxlen = 9;
            }
            if (this.options['time_format_24h'] === false && this.options['seconds'] === false) {
                var maxlen = 9;
            }
            if (this.options['time_format_24h'] === false && this.options['seconds'] === true) {
                var maxlen = 12;
            }
            var reset = false;
            var val = el.val();
            var currpos = el.caret().start;
            var cval = this._lastInputVal;
            if (parseInt(val.substr(val.length-2, 1)) != NaN && val.substr(val.length-1,1) == 'a') {
                    val = val.substr(0, val.length-1) + ' am';
                currpos += 3;
            }
            if (parseInt(val.substr(val.length-2, 1)) != NaN && val.substr(val.length-1,1) == 'p') {
                val = val.substr(0, val.length-1) + ' pm';
                currpos += 3;
            }
            if (currpos == 2) {
                if(parseInt(val.substr(0, 1)) != NaN
                    && parseInt(val.substr(0, 2)) == NaN) {
                    val = val.substr(0, 1) + ':';
                }
            }
            if (currpos == 3) {
                if(val.substr(1,1) != ':' && parseInt(val.substr(1, 1)) != NaN) {
                    if (this.options['time_format_24h'] === true && val.substr(0, 2) > 23) {
                        //rest invalid time
                        val = '00';
                        currpos = 0;
                    } else if (this.options['time_format_24h'] === false && val.substr(0, 2) > 12) {
                        //rest invalid time
                        val = '00';
                        currpos = 0;
                    } else {
                        val = val.substr(0, 2) + ':';
                    }
                }
            }

            if (val.match(/^[0-9\:]+$/) || val.match(/^([1-9]|10|11|12){2}:[0-9]{2}\ am|pm/)) {
                var ts = this._ctrlsTime.hours +':'+this._ctrlsTime.minutes;
                cval = val.substring(0, currpos)+ts.substring(currpos, ts.length);
                if (reset !== false) {
                    this.options['time_display'].caret(reset, reset+2)
                }
            }
            if (cval.length > maxlen-1) {
                cval = cval.substring(0, maxlen-1);
            }
            this.options['time_display'].val(cval);
            this.options['time_display'].caret(currpos, cval.length);
        }
    });
})(jQuery);