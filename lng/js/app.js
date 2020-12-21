(function (window, document, Plotly, ko) {
  // BBB: It is better to store this outside as a JSON file
  // To do so init() should be a promise and render() it after init is finished
  var all_fr_data_list = [
   {"name":"FiiO FD5 (R)", "url":"data/fiio_fd5_r_fr.json"},
   {"name":"FiiO FD5 (R); narrow nozzle triple flange", "url":"data/fiio_fd5_r_narrow_triple_flange_fr.json"},
   {"name":"KZ EDX (L)", "url":"data/kz_edx_l_fr.json"},
   {"name":"KZ ATR (R)", "url":"data/kz_atr_r_fr.json"},
   {"name":"FiiO FH3 (R)", "url":"data/fiio_fh3_r_fr.json"},
   {"name":"FiiO FH5 (R)", "url":"data/fiio_fh5_r_fr.json"},
   {"name":"RE800 Silver (R); single flange", "url":"data/hifiman_re800_silver_r_single_flange_fr.json"},
   {"name":"RE800 Silver (R); double flange", "url":"data/hifiman_re800_silver_l_double_flange_fr.json"},
   {"name":"TRN V90 (R)", "url":"data/trn_v90_r_fr.json"},
   {"name":"ER2SE (R)", "url":"data/er2se_r_fr.json"}
  ];

  var view_model = {
    init: function() {
      // TODO: consider unifying the two lists
      view_model.trace_list = [];
      view_model.fr_data_list = all_fr_data_list;
      view_model.fr_data_list.map(function (fr_data, index) {
        if (index == 0) {
          fr_data.is_display = ko.observable(true);
        } else {
          fr_data.is_display = ko.observable(false);
        }
      });
      ko.applyBindings(view_model);
    },

    getDisplayTraceList: function() {
      // XXX: not efficient
      return view_model.trace_list.filter(function(trace) {
        return view_model.findFrData(trace.name).is_display();
      });
    },

    getDispalyFrDataList: function() {
      return view_model.fr_data_list.filter(function(fr_data) {
        return fr_data.is_display();
      });
    },

    findObject: function(name, object_list) {
      var target = undefined;
      for (var i=0; i < object_list.length; i++) {
        trace = object_list[i];
        if (trace.name == name) {
          target = trace;
          break;
        }
      }
      return target;
    },

    findFrData: function(name) {
      return view_model.findObject(name, view_model.fr_data_list);
    },

    findTrace: function(name) {
      return view_model.findObject(name, view_model.trace_list);
    },

    updateTrace: function(name, fr_json) {
      // TODO: Concider to stop finding from the list
      var trace = view_model.findTrace(name);
      if (trace == undefined) {
        // XXX: shoud be define as a meta data
        trace = {'type':'scatter', name:undefined, x:undefined, y:undefined};
        view_model.trace_list.push(trace);
      }
      trace.name = name;
      trace.x = fr_json[0];
      trace.y = fr_json[1];
    },

    addFR: function(name, url) {
      return window.fetch(url)
      .then(function(response) {
        return response.json();
      })
      .then(function(json) {
        view_model.updateTrace(name, json);
      });
    },

    render : function() {
      var promise_list = []
      view_model.getDispalyFrDataList().forEach(function (fr_data) {
        // XXX: should addFR only if the fr_data is not loaded
        promise_list.push(view_model.addFR(fr_data.name, fr_data.url));
      });
      Promise.all(promise_list)
      .then(function () {
        Plotly.newPlot(view.plot_id, view_model.getDisplayTraceList(),
                       view.layout, view.plot_option);
      });
      return true;
    },
  };

  var view = {
    layout : {
      title: {text:'SPL', font: {size:20}},
      showlegend: true,
      legend: {orientation: 'h'},
      //height: 640,
      //width: 865,
      margin: { l: 40, r: 25, t: 30, b: 30 },
      xaxis: {
        type: 'log',
        range: [1.3, 4.302],
        fixedrange: true,
        tickfont: {size: 11},
        //tickangle: 0,
        tickvals: [20,30,40,50,60,80,100,200,300,400,500,600,800,
                   1000,2000,3000,4000,5000,6000,8000,10000,20000],
        ticktext: ['20','30','40','','60','80',
                   '100','200','300','400','','600','800',
                   '1k','2k','3k','4k','','6k','8k','10k','20.0kHz'],
        //autorange: true
        linewidth: 1,
        linecolor: '#ddd',
        mirror: true,
      },
      yaxis: {
        title: 'dB',
        range: [65, 115],
        fixedrange: true,
        //dtick: 5,
        tickvals: [70,75,80,85,90,95,100,105,110,115],
        linewidth: 1,
        linecolor: '#ddd',
        mirror: true,
        //autorange: true
      }
    },
    plot_option : {
      modeBarButtonsToRemove: ['zoom2d', 'pan2d','select2d',
                               'lasso2d', 'zoomIn2d', 'zoomOut2d',
                               'autoScale2d','resetScale2d',
                               'toggleSpikelines',
                               'hoverClosestCartesian',
                               'hoverCompareCartesian',
                               ],
      responsive: true,
      displaylogo: false,
      scrollZoom: false
    },
    plot_id: 'plot',
  };

  view_model.init();
  view_model.render();
})(window, document, Plotly, ko);
