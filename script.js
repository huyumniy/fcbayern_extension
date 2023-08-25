// ==UserScript==
// @name         Tickets Notifier
// @namespace    tickets.fcbayern.com
// @version      3.0.11
// @description  Checking new tickets
// @author       You
// @match        *.tickets.fcbayern.com/*
// @grant        none
// ==/UserScript==

(function() {
	let Config = {
		v: '3.0.11'
	}

	let Info = {}
	let UserSettings = {}
	let Data = {
		state: {
			active: false,
			waiting: false
		},

		settings: UserSettings
	}

	let UI = {
		__settingsHTML: `<div class="tickets tickets_popup_wrapper">
	    <div class="tickets tickets_popup">
	      <h1 class="tickets tickets_h1">Настройки</h1>

	      <div class="tickets_select" data-select="need_relative">
	      <div class="tickets tickets_selector" data-value="false">Сбор любых билетов</div>
	      <div class="tickets tickets_selector tickets_selector_selected" data-value="true" title="Собирать только идущие друг за другом билеты">Сбор соседних билетов</div>
	      </div>

	      <hr class="tickets tickets_hr">

	      <h2 class="tickets tickets_h2">Билеты</h2>

	      <span class="tickets tickets_title">Цена:</span>

	      <input type="number" name="minimum_price" placeholder="Минимальная" class="tickets tickets_input">
	      —
	      <input type="number" name="maximum_price" placeholder="Максимальная" class="tickets tickets_input">


	      <span class="tickets tickets_title">Количество:</span>
	      <div class="tickets_select" data-select="count">
	      <div class="tickets tickets_selector" data-value="1">1</div>
	      <div class="tickets tickets_selector" data-value="2">2</div>
	      <div class="tickets tickets_selector" data-value="3">3</div>
	      <div class="tickets tickets_selector tickets_selector_selected" data-value="4">4</div>
	      </div>

	      <br>
	      <div class="tickets tickets_data">
	        <input type="number" name="block" placeholder="Сектор" class="tickets tickets_input" style="width: 32%">
	      	<input type="number" name="row" placeholder="Ряд" class="tickets tickets_input" style="width: 32%">
	        <input type="number" name="seat" placeholder="Место" class="tickets tickets_input" style="width: 32%"><br>
	      </div>
				<button class="tickets tickets_button add_ticket">+</button>
	      <p class="tickets">Также можно указать только сектор, только ряд или только место (или любые комбинации)</p>

	      <hr class="tickets tickets_hr">

	      <h2 class="tickets tickets_h2">Интервал обновления</h2>
	      <input type="number" name="interval" placeholder="Секунды" class="tickets_input" value="30">
	      <span class="tickets_notice">Оптимальное время: 30 сек</span>


	      <span class="tickets tickets_title">Автоматически перезапускать скрипт после добавления:</span>
	      <div class="tickets_select" data-select="auto_restart">
	      <div class="tickets tickets_selector" data-value="false">Нет</div>
	      <div class="tickets tickets_selector tickets_selector_selected" data-value="true">Да</div>
	      </div>

	      <br><br>

	      <button class="tickets tickets_button" id="tickets_cancel">Отмена</button>
	      <button class="tickets tickets_button tickets_button_colored" id="tickets_start">Запуск</button>
	    </div>
	    </div>`,

    	__settingsCSS: `.tickets {
	      font-family: 'Calibri';
	    }

	    .tickets_popup_wrapper {
	      position: fixed;
	      top: 0;
	      left: 0;
	      width: 100%;
	      height: 100%;
	      background: rgba( 0, 0, 0, .5 );
	      overflow: auto;
	      z-index: 1000;
	      display: none;
	    }

	    .tickets_popup {
	      width: 500px;
	      padding: 15px;
	      box-sizing: border-box;
	      margin: 50px auto;
	      background: #fff;
	      border-radius: 4px;
	      position: relative;
	    }

	    .tickets_h1, .tickets_h2 {
	      margin: 5px 0;
	      font-weight: bold;
	    }

	    .tickets_h1 {
	      font-size: 30px;
	    }

	    .tickets_h2 {
	      font-size: 24px;
	    }

	    .tickets_select {
	        display: inline-block;
	    }

	    .tickets_selector {
	      margin: 3px 0;
	      padding: 5px 15px;
	      border: 1px solid #999;
	      display: inline-block;
	      border-radius: 4px;
	      cursor: pointer;
	      color: #555;
	    }

	    .tickets_selector:hover {
	      background: rgba( 0, 0, 0, 0.05 );
	    }

	    .tickets_selector_selected {
	      color: #000;
	      font-weight: bold;
	      border: 1px solid #2482f1;
	    }

	    .tickets_hr {
	      width: 50%;
	      border: 0;
	      height: 1px;
	      background: #aaa;
	      margin: 10px auto;
	    }

	    .tickets_input {
	      margin: 3px 0;
	      padding: 5px 15px;
	      border-radius: 4px;
	      border: 1px solid #999;
	      font-size: 16px;
	      font-family: 'Calibri';
	      outline: none;
	    }

	    .tickets_input:focus {
	       border: 1px solid #2482f1;
	    }

	    .tickets_title {
	      margin-right: 10px;
	    }

	    .tickets_button {
	      padding: 5px 15px;
	      border: 1px solid #aaa;
	      border-radius: 4px;
	      font-family: 'Calibri';
	      font-size: 16px;
	      cursor: pointer;
	    }

	    .tickets_button_colored {
	      font-weight: bold;
	      background: #2482f1;
	      border: 1px solid #2482f1;
	      color: #fff;
	    }

	    .tickets_notice {
	        color: #555;
	    }
		.settings-info{
			position: fixed;
			bottom: 15px;
			right: 15px;
			padding: 15px;
			background: #2482f1;
			color: #fff;
			width: 200px;
		}
	    `,
    	__settingsInfoCSS: `.settings-info{
			position: fixed;
			bottom: 15px;
			left: 15px;
			padding: 15px;
			background: #c22331;
			color: #fff;
			width: 300px;
			border-radius: 5px;
		}
		.settings-info p{
			font-family: 'Calibri';
			margin-bottom: 0;
		}
	    `,
		__infoHTML: `<div class="settings-info" id="settings-info">
	    </div>`,
	    init: function () {
	    	document.body.innerHTML += UI.__settingsHTML

	    	let style = document.createElement( 'style' );
	    	style.innerText = UI.__settingsCSS;

	    	document.head.appendChild( style );

	    	let cancel_button = document.getElementById( 'tickets_cancel' );
	        cancel_button.onclick = UI.closePopup;

	        let start_button = document.getElementById( 'tickets_start' );
	        start_button.onclick = start;


	        var selectors = document.getElementsByClassName( 'tickets_selector' );

	        for ( var i = 0; i < selectors.length; i++ ) {
	            selectors[i].onclick = function() {
	                UI.select( this );
	            }
	        }
					let tickets_data =  document.getElementsByClassName( 'tickets_data' )[0];
					let add_ticket = document.getElementsByClassName( 'add_ticket' )[0];

					add_ticket.onclick = function ( event ) {
						if ( event.target.classList.contains( 'add_ticket' ) ) {

							const newBlockInput = UI.addTicket('number', 'block', 'Сектор', 32);
							const newRowInput = UI.addTicket('number', 'row', 'Ряд', 32);
							const newSeatInput = UI.addTicket('number', 'seat', 'Место', 32);

							tickets_data.appendChild(newBlockInput)
							tickets_data.appendChild(newRowInput)
							tickets_data.appendChild(newSeatInput)
							let br = document.createElement('br');
							tickets_data.appendChild(br)
						}
					}

	        let wrapper = document.getElementsByClassName( 'tickets_popup_wrapper' )[0];
					
	        wrapper.onclick = function ( event ) {
	            if ( event.target.classList.contains( 'tickets_popup_wrapper' ) ) UI.closePopup();
	        }
	    },

	    openPopup: function () {
	    	let el = document.getElementsByClassName( 'tickets_popup_wrapper' )[0];
	        el.style.display = 'block';
	        document.body.style.overflow = 'hidden';
	    },

	    closePopup: function () {
	    	let el = document.getElementsByClassName( 'tickets_popup_wrapper' )[0];
	        el.style.display = 'none';
	        document.body.style.overflow = 'auto';
	    },

			addTicket: function (type, name, placeholder, width) {
				let input = document.createElement('input');
				input.type = type;
				input.name = name;
				input.placeholder = placeholder;
				input.className = 'tickets tickets_input';
				input.style.width = `${width}%`;
				
				return input;
			},

	    select: function ( el ) {
	        let parent = el.parentNode;
	        let els = parent.getElementsByClassName( 'tickets_selector' );

	        for ( let i = 0; i < els.length; i++ ) {
	            els[i].classList.remove( 'tickets_selector_selected' );
	        }

	        el.classList.add( 'tickets_selector_selected' );
	    },

	    getSelect: function ( select ) {
	    	var selectors = document.getElementsByClassName( 'tickets_select' );

	        for ( var i = 0; i < selectors.length; i++ ) {
	            var item = selectors[i];
	            var name = item.getAttribute( 'data-select' );
	            if ( select != name ) continue;


	            var selected = item.getElementsByClassName( 'tickets_selector_selected' )[0];
	            return selected.getAttribute( 'data-value' );
	        }
	    },

	    getValue: function ( name ) {
	    	return document.getElementsByName( name )[0].value;
	    },

	    createButton: function ( text, func ) {
	        var btn = document.createElement( 'a' );
	        btn.className = 'button small cart-buttons-second-button';
	        btn.innerHTML = text;
	        btn.style.position = 'fixed';
	        btn.style.right = '15px';
	        btn.style.bottom = '15px';
	        btn.style.cursor = 'pointer';
	        btn.style.fontFamily = 'Calibri';
	        btn.style.fontWeight = 'bold';
	        btn.href = '#';

	        btn.onclick = function ( e ) {
	            e.preventDefault();
	            func();
	        };

	        document.body.appendChild( btn );
    	},

    	btnClick: function ( id ) {
    		let el = _g( id );
    		return el.click();
    	}
	}

	let Pages = {
		init: function () {
			let observer = new MutationObserver( Pages.__onChange )
			let config = {
				subtree: true,
				childList: true,
				attributes: true
			}

			let id = 'PleaseWaitPopup_backgroundElement';
			let elem = _g( id )

			observer.observe( elem, config )
		},

		__onChange: function ( event ) {
			console.log( 'Mutation observer callback' )

			let id = 'PleaseWaitPopup_backgroundElement';
			let elem = _g( id )

			if ( elem.style.display == 'none' ) {
				Data.state.waiting = false
				console.log( 'Waiting: ', Data.state.waiting )
				main()
			}
		},

		getCurrentPageNumber: function () {
			return Pages._pageNumberInfo().current
		},

		getTotalPagesCount: function () {
			return Pages._pageNumberInfo().total
		},

		_pageNumberInfo: function () {
			let id = 'ctl00_ContentMiddle_TicketList1_GridView1_ctl01_lblPageInfo';
			let el = _g( id );

			if ( !!el === false ) {
				return {
					current: 1,
					total: 1
				}
			}

			let parts = el.innerText.split( ' ' );

			return {
				current: parseInt( parts[1] ) || 1,
				total: parseInt( parts[3] ) || 1
			}
		},

		navigateNext: function () {
			let id = 'ctl00_ContentMiddle_TicketList1_GridView1_ctl01_btnNextPage';
			return UI.btnClick( id );
		},

		navigateLast: function () {
			let id = 'ctl00_ContentMiddle_TicketList1_GridView1_ctl01_btnLastPage';
			return UI.btnClick( id );
		},

		navigatePrev: function () {
			let id = 'ctl00_ContentMiddle_TicketList1_GridView1_ctl01_btnPrevPage';
			return UI.btnClick( id );
		},

		navigateFirst: function () {
			let id = 'ctl00_ContentMiddle_TicketList1_GridView1_ctl01_btnFirstPage';
			return UI.btnClick( id );
		}
	}

	let Tickets = {
		__tickets: [],
		__sorted: {},

		parse: function () {
	        let tables = document.getElementsByTagName( 'table' );
	        let tickets = [];
	        let item, rows;
	        for ( let i = 0; i < tables.length; i++ ) {
	        	item = tables[i];
	            if ( item.getAttribute( 'rules' ) != 'rows' ) continue;

	            rows = item.getElementsByTagName( 'td' );

	            for ( let k = 0, c = rows.length; k < c; k++ ) {
	                var row = rows[k];
					//console.log(row);
					if( row.innerHTML == 'No tickets available') continue;
					
	                var price = row.children[0].children[3].children[0].innerHTML;
					console.log(row);
					console.log(price);
					console.log(row.children[0].children[1].children[0].innerHTML);
	                if ( row.children.length == 0 ) continue;
	                //if ( row.getElementsByClassName( 'fcb-row' ).length == 0 ) continue; // Если внутри нет данных о местах, то идем дальше


	                var ticket = {
	                    'block': row.children[0].children[0].children[0].innerHTML,
	                    'row': parseInt( row.children[0].children[1].children[0].innerHTML ),
	                    'seat': parseInt( row.children[0].children[2].children[0].innerHTML ),
	                    'price': parseInt( price ),
	                    'full_price': price,
	                    'href': row.children[1].children[0].children[0].href,
	                    'btn': row.children[1].children[0].children[0]
	                }

	                tickets.push( ticket );
	            }
	        }
					console.log(tickets);
				
	        Tickets.__tickets = tickets
	        return tickets
	    },

	    filter: function ( tickets, settings ) {
	    	tickets = tickets || Tickets.__tickets
	    	let filtered = [];

	    	Tickets.__tickets.forEach( function( ticket ) {
	    		if ( !!settings.min && ticket.price < settings.min ) return;
	    		if ( !!settings.max && ticket.price > settings.max ) return;

	    		if ( !!settings.ticket.block && settings.ticket.block != ticket.block ) return;
	    		if ( !!settings.ticket.row && settings.ticket.row != ticket.row ) return;
	    		if ( !!settings.ticket.seat && settings.ticket.block != ticket.seat ) return;

	    		filtered.push( ticket )
	    	} )

	    	Tickets.__tickets = filtered
	    	return filtered
	    },

	    sort: function ( tickets ) {
	    	tickets = tickets || Tickets.__tickets

	    	let single = [];
	        let tmp = [];
	        let relatives = {};
	        let ret = {
	            "single": [],
	            "relatives": []
	        };

	        let better = {
            	"count": 0,
            	"block": "",
            	"row": ""
            }

	        for ( let i = 0, c = tickets.length; i < c; i++ ) {
	            var t1 = tickets[i];
	            var t2 = t1;
	            var block = t1.block;
	            var row = t1.row;

	            var count = 0;

	            for ( var k = 0; k < c; k++ ) {
	                t2 = tickets[k];
	                d = Math.abs( t1.seat - t2.seat );
	                if ( t1.block == t2.block && t1.row == t2.row && d == 1 ) {
	                    if ( !( !!relatives[block] ) ) {
	                        relatives[block] = {};
	                    }

	                    if ( !( !!relatives[block][row] ) ) {
	                        relatives[block][row] = [];
	                    }

	                    var l = relatives[block][row];
	                    if ( l.indexOf( t2 ) == -1 ) {
	                    	relatives[block][row][l.length] = t2;
	                    	count++

	                    	if ( relatives[block][row].length > better.count ) {
	                    		better.count = relatives[block][row].length
	                    		better.block = block
	                    		better.row = row
	                    	}
	                    }
	                } else {
	                    if ( single.indexOf( t2 ) == -1 ) single[single.length] = t2;
	                }
	            }
	        }

	        ret.single = single
	        ret.relatives = relatives
	        ret.better = better

	        Tickets.__sorted = ret
	        return ret;
	    },

	    select: function ( sorted_tickets ) {
	    	sorted_tickets = sorted_tickets || Tickets.__sorted
	    	let tickets = []

	    	if ( Data.settings.need_relative == "false" ) {
	    		tickets = sorted_tickets.single.slice( 0, Data.settings.count )
	    		Tickets.__selected = tickets
	    		console.log( 'Selected tickets:', Tickets.__selected )
	    		return
	    	}

	    	let better = sorted_tickets.better
	    	if ( better.count == 0 ) return;

	    	console.log( 'Better: ', better )
	    	tickets = sorted_tickets.relatives[better.block][better.row]


	    	console.log( 'Better tickets: ', tickets )

	    	if ( tickets.length < 2 ) return
	    	Tickets.__selected = tickets
	    },

	    add: function ( selected_tickets ) {
	    	tickets = selected_tickets || Tickets.__selected

	    	let pos = 0

	    	Tickets.timeout = setTimeout( tm, 0 )

	    	function tm() {
	    		Tickets.timeout = setTimeout( tm, 100 )
	    		if ( Data.state.waiting ) return
	    		console.log( 'Trying to add ticket to cart:', tickets[pos] )
	    		tickets[pos].btn.click()
	    		console.log( 'Button: ', tickets[pos].btn );

	    		pos++


	    		Data.state.waiting = true;
	    		Data.state.adding = true;
				
				var cart = document.getElementById('ctl00_SmallCart2_label_addontext'); 
				var table = cart.getElementsByTagName('table'); 
				var tr = table[0].getElementsByTagName('tr'); 


	    		if ( pos >= tickets.length && parseInt(tr[2].innerText) > 0) {
	    			console.log( 'Tickets added:', tickets.length )
	    			var n = new Notification( 'Билеты добавлены', {
	    				'body': "Добавлено билетов в корзину: " + tickets.length,
	    				'image': 'https://image.freepik.com/free-photo/_1101-57.jpg'
	    			} );
					
					var audio = new Audio('https://proxy.notificationsounds.com/notification-sounds/notification-tone-swift-gesture/download/file-sounds-1235-swift-gesture.mp3');
					audio.play();


	    			clearTimeout( Tickets.timeout )

	    			setTimeout( stop, 5000 )
	    			return
	    		}
	    	}
	    },

	    categories: {
	    	__categories: [
	    		'Kategorie 1',
	    		'Kategorie 2',
	    		'Kategorie 3',
	    		'Kategorie 4',
	    		'Kategorie 5' 
	    	],

	    	__id: 'ctl00_ContentMiddle_TicketList1_DropDownList1',

	    	getTicketsCount: function( cat ) {
		    	let value = Tickets.categories.__categories[cat - 1]

		    	let select = _g( Tickets.categories.__id )
		    	let result = 0
		    	let parts = []

		    	for ( let i = 1; i < select.options.length; i++ ) {
		    		if ( select.options[i].value !== value ) continue

		    		parts = select.options[i].innerText.split( ' ' )
		    		result = Number( parts[parts.length - 1] )
		    		break
		    	}

		    	return result
		    },

		    showTickets: function( cat ) {
		    	let value = Tickets.categories.__categories[cat - 1]

		    	let select = _g( Tickets.categories.__id )

		    	for ( let i = 1; i < select.options.length; i++ ) {
		    		if ( select.options[i].value !== value ) continue

		    		select.options[i].selected = true
			    	select.onchange()
		    		break
		    	}

		    	return true
		    },

		    hasTickets: function( cat ) {
		    	let tickets_count = Tickets.categories.getTicketsCount( cat )
		    	return tickets_count > 0
		    },

		    getCurrent: function() {
		    	let select = _g( Tickets.categories.__id )
		    	let result = 0

		    	for ( let i = 1; i < select.options.length; i++ ) {
		    		if ( !select.options[i].selected ) continue

	    			result = i
		    		break
		    	}

		    	return Number( result )
		    }
	    }
	}

	function init() {
		// Получаем данные и localstorage
		let ls_settings = getLSSettings();

		if ( ls_settings !== null ) {
			Data = ls_settings
			UserSettings = Data.settings
		}

		window.__TICKETS_NOTIFER = {
			scheduler: scheduler
		}
		
		console.log(window.__TICKETS_NOTIFER);

		Info.currentPage = Pages.getCurrentPageNumber()
		Info.totalPagesCount = Pages.getTotalPagesCount()

		if ( Data.state.active === true ) {
			
			
			UI.createButton( '+', UI.addTicket )
			UI.createButton( 'Остановить', stop )
			main();
			
			console.log(ls_settings);

	    	let div = document.createElement( 'div' );
	    	div.setAttribute("id", "settings-info");
	    	div.setAttribute("class", "settings-info");
	    	document.body.appendChild( div );
			
	    	let style = document.createElement( 'style' );
	    	style.innerText = UI.__settingsInfoCSS;
	    	document.head.appendChild( style );
			
			let infoWindow = '';
			infoWindow += (ls_settings.settings.cat)? '<p>Категория: ' + ls_settings.settings.cat + '</p>' : '';
			infoWindow += (ls_settings.settings.count)? '<p>Количество: ' + ls_settings.settings.count + '</p>' : '';
			infoWindow += (ls_settings.settings.need_relative)? '<p>Сбор соседних билетов: ' + ls_settings.settings.need_relative + '</p>' : '';
			infoWindow += '<div style="display: flex"><p><b>Цена</b><span> ' + ls_settings.settings.min + '</span> - ';
			infoWindow += '<span>' + ls_settings.settings.max + '</span></p></div>';
			infoWindow += (ls_settings.settings.interval)? '<p>Интервал обновления: ' + ls_settings.settings.interval + ' сек.</p>' : '';
			infoWindow += (ls_settings.settings.ticket.block)? '<p>Сектор: ' + ls_settings.settings.ticket.block + ' </p>' : '';
			infoWindow += (ls_settings.settings.ticket.row)? '<p>Ряд: ' + ls_settings.settings.ticket.row + ' </p>' : '';
			infoWindow += (ls_settings.settings.ticket.seat)? '<p>Место: ' + ls_settings.settings.ticket.seat + ' </p>' : '';
			
			document.getElementById( 'settings-info' ).innerHTML = infoWindow;
		} else {
			UI.init()
			UI.createButton( 'Запуск', UI.openPopup )
		}

		if ( Notification.permission !== 'granted' ) {
            Notification.requestPermission().then( function ( permission ) {
                if ( permission == 'granted' ) {
                    var n = new Notification( 'Уведомления', {'body': "Теперь Вы будете получать уведомления о событиях."} );
                }
            } );
        }

		console.log( 'Info ', Info )

		Pages.init()
	}

	function start() {
		console.log( 'Starting tickets notifer...' );
		console.log( 'v', Config.v );

		UserSettings = getSettings()
		if ( UserSettings === false ) return;

		// Обновляем состояние
		Data.settings = UserSettings
		Data.state.active = true

		// И сохраняем его
		setLSSettings( Data )

		console.log( 'Settings:', UserSettings );

		UI.createButton( 'Остановить', stop )

		UI.closePopup();
		main();
		reload()
	}

	function stop() {
		Data.state.active = false;
		Data.state.adding = false;
		Data.state.waiting = false;
		setLSSettings( Data );

		reload();
	}


	function main() {
		let error = document.getElementById( 'ctl00_ContentMiddle_ErrorMessages1_labeleventtablehead' );
		if(error){
			UI.btnClick('ctl00_ContentMiddle_ErrorMessages1_button_back');
		}
		let onHomepage = document.getElementById( 'ctl00_ContentMiddle_EventListImages1_GridView1_ctl03_SELECTEVENT' );
		if(onHomepage){
			UI.btnClick('ctl00_ContentMiddle_EventListImages1_GridView1_ctl03_SELECTEVENT');
		}

		
		if ( Data.state.adding == true ) return
		console.log( 'Processing tickets notifier' )

		Tickets.parse()
		let tickets = Tickets.__tickets
		console.log( 'Finded tickets:', tickets )

		Tickets.filter( tickets, UserSettings )
		let filtered_tickets = Tickets.__tickets
		console.log( 'Filtered tickets:', filtered_tickets )

		Tickets.sort();
		let sorted_tickets = Tickets.__sorted
		console.log( 'Sorted tickets:', sorted_tickets )

		Tickets.select()
		let selected_tickets = Tickets.__selected
		if (typeof selected_tickets !== 'undefined' && selected_tickets.length > 0 ) Tickets.add()
		console.log( 'Selected tickets:', selected_tickets )

//Tickets.add(sorted_tickets.single)
		//Data.state.nextAction = 'nextPage'


		createSchedulerScript()

		let tickets_count = Tickets.categories.getTicketsCount( Data.settings.cat )
		console.log( 'Category Tickets Count ', tickets_count )
		console.log( 'Current Category ', Tickets.categories.getCurrent() )

		if ( Tickets.categories.hasTickets( Data.settings.cat ) && Tickets.categories.getCurrent() != Data.settings.cat ) {
			console.log( 'Show category tickets' )
			Tickets.categories.showTickets( Data.settings.cat )
		}
	}

	function scheduler() {
		if ( Data.state.waiting || ( Date.now() / 1000 ) - window.lastScheduled < Data.settings.interval ) return;

        reload()

		Info.currentPage = Pages.getCurrentPageNumber()
		Info.totalPagesCount = Pages.getTotalPagesCount()

		let current_page = Info.currentPage
		let total_pages = Info.totalPagesCount

		console.log( 'Scheduled process', Info )

		if ( total_pages == 1 ) reload()

		let action = ''
		window.lastScheduled = Date.now() / 1000



		return
		if ( Data.state.nextAction == 'nextPage' ) {
			action = current_page + 1 > total_pages ? 'first' : 'next'

			switch ( action ) {
				case 'first':
					reload()
					//Pages.navigateFirst()
					break

				case 'next':
					Pages.navigateNext()
			}

			Data.state.waiting = true
		}
	}

	function createSchedulerScript() {
        console.log( window.__TICKETS_NOTIFER );
		
        let script = document.createElement( 'script' );
        script.innerHTML = 'setInterval( function () { window.__TICKETS_NOTIFER.scheduler(); }, ' + Data.settings.interval + ' * 1000 );';
        document.body.appendChild( script );

        console.log( 'Script added' );
	}

	function getSettings() {
		var fields = {
            'block': 'cектор',
            'row': 'ряд',
            'seat': 'место',
            'max': 'максимальная цена',
            'interval': 'интервал обновления',
            'reload_delay': 'задержка перезагрузки'
        };
        var require = []

        var count = parseInt( UI.getSelect( 'count' ) )
        var need_relative = UI.getSelect( 'need_relative' )
        var need_ticket = UI.getSelect( 'need_ticket' )
        var cat = Number( UI.getSelect( 'cat' ) )
        var min = parseInt( UI.getValue( 'minimum_price' ) )
        var max = parseInt( UI.getValue( 'maximum_price' ) )
        var interval = parseInt( UI.getValue( 'interval' ) )

        var block = parseInt( UI.getValue( 'block' ) )
        var row = parseInt( UI.getValue( 'row' ) )
        var seat = parseInt( UI.getValue( 'seat' ) )

        min = isNaN( min ) ? 0 : min
        max = isNaN( max ) ? 0 : max


        if ( need_ticket == 'true' ) {
            if ( isNaN( block ) ) require.push( fields.block )
            if ( isNaN( row ) ) require.push( fields.row )
            if ( isNaN( seat ) ) require.push( fields.seat )
        }

        if ( max == 0 ) require.push( fields.max )
        if ( isNaN( interval ) ) require.push( fields.interval )

        if ( require.length != 0 ) {
            var msg = require.join( ', ' )
            alert( 'Пожалуйста, заполните следующие поля: ' + msg )
            return false
        }

        var data = {
            'count': count,
            'need_relative': need_relative,
            'min': min,
            'max': max,
            'interval': interval,
            'need_ticket': need_ticket,
            'cat': cat,
            'ticket': {
                'block': block,
                'row': row,
                'seat': seat
            }
        }

        return data
    }

    function reload() {
    	return window.location.reload()
    }

    function setLSSettings( data ) {
    	return window.localStorage.setItem( 'settings', JSON.stringify( data ) );
    }

    function getLSSettings() {
    	return JSON.parse( window.localStorage.getItem( 'settings' ) );
    }

	function _g( id ) {
		return document.getElementById( id );
	}

	// Initialization
	init()

})(window)