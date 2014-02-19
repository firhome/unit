/*
* felix.feng
* 2014-02-18
*/

/* 
	key 和 rule请保持一致的key
*/
var key = {
	'TH':'TH|千',
	'M':'M|百万',
	'B':'B|十亿'
};

var rule = {
	'TH': {
		'r': function(n) {
			if(n >= 1000 && n < 1000000){
				return this.fn;
			};
		},
		'fn': function(n) {
			var n = n * 1000
			return n;
		}
	},
	'M': {
		'r': function(n) {
			if(n >= 1000000 && n < 100000000){
				return this.fn;
			};
		},
		'fn': function(n) {
			var n = n * 1000000
			return n;
		}
	},
	'B': {
		'r': function(n) {
			if(n >= 100000000){
				return this.fn;
			};
		},
		'fn': function(n) {
			var n = n * 1000000000
			return n;
		}
	}
};

var reg = {
	'f':/[^0-9\.\-]/g //去掉除数字 点 外的任意字符
};
// 私有方法. 添加逗号, 四舍五入 , 格式化value为数字

var unit = function(opts){
	if(!opts) return;
	var n = opts.num || '',
		num = n + '',  // number to string
		newNum = '', // new number 
		comma = '', // comma
		numUnit = '',
		_key,
		_formatNum,
		_rule;

	//获取单位
	this.getUnit = function(key,str){

		var _key = {n:null,c:null};
		for(var k in key){
			var s = key[k].split('|');
			for(var i = 0,l = s.length; i < l; i++){
				var _reg = new RegExp('[1-9].*'+s[i] + '$');
				if(_reg.test(str)){
					_key.n = s[i]; //获取单位
					_key.c = k; //获取单位的code
					break;
				};
			};
		}

		return _key;
	};

	//将格式化的数字分割,取第一个负号和小数点的位置 --1.56-....664 - > -1.56664
	this._splitFormat = function(n) {

		var nsp = n.split(''),
			_trr = [],
			a1, a2,ty;
		var nsp1 = nsp[0];
		if(/\-/.test(nsp1)){
			ty = 1
		};
		if(/\./.test(nsp1)){
			ty = 2
		};
		if(/\d/.test(nsp1)){
			ty = 3
		};
		for (var i = 0, l = nsp.length; i < l; i++) {
			var as = nsp[i];
			if (as == '-') {
				if (!a1 && ty == 1) {
					a1 = as;
					_trr.push(as);
				}
				continue;
			};

			if (as == '.') {
				if ((ty != 1 || a1) && !a2) {
					a2 = as;
					_trr.push(as);
				};
				continue;
			}

			_trr.push(as);
		}; 

		return _trr.join('');
	};

	//增加逗号
	this.addComma = function(n){
		var s1 = '',
			ntr = n + '';

		if(n < 0){
			s1 = '-';
			ntr = ntr.replace(s1,'');
		};

		var _sn = ntr.split('.'),
			_re = _sn[0].length % 3,
			_floor = '';

		if(_sn.length == 2){
			_floor = '.' + _sn[1];
		};

		var s2 = _sn[0];

		if(_re){
			return s1 + s2.slice(0,_re) +  s2.slice(_re).replace(/(\d{3})/g,',$1') + _floor;
		}else{
			return s1 + s2.replace(/(\d{3})/g,',$1').slice(1) + _floor;
		}

	};

	//增加单位
	this._addUnit = function(n){
		var _abs = Math.abs(n),fn,_k;
		for(var i in rule){
			if(rule[i].r(_abs)){
				fn = rule[i]['fn'];
				_k = key[i].split('|')[0];
				break;
			};
		};
		var exc;
		if(fn){
			exc = fn(1);
		}else{
			exc = 1;
			_k = '';
		}
		var _new = n / exc;
		var _c = this.addComma(_new) + _k;
		return _c;
	};

	//获取_key的关键字和代码
	_key = this.getUnit(key,num);


	//获取单位的方法
	if(_key.c){

		_rule = rule[_key.c]['fn'];

	};
	//只保留数字,负号,小数点
	_formatNum = num.replace(reg['f'],'');



	if(!/[0-9]/.test(_formatNum)){
		return {
			n:'',
			f:'',
			u:''
		};
	};
	//获取格式化后的原始数字
	newNum = this._splitFormat(_formatNum);

	//转为数字
	newNum = parseFloat(newNum); 


	//数字格式化好了. 接下来添加后缀
	/* 不换算单位 例: 123456789TH
	if(_key.n != null){
		var _ac = this.addComma(newNum);
		numUnit = _ac + _key.n;
		newNum = _rule(newNum);
	}else{
		numUnit = this._addUnit(newNum);
	};

	*/

	//换算单位: 123456789TH - >123.456789B
	if(_key.n != null){
		newNum = _rule(newNum);
	};

	numUnit = this._addUnit(newNum);
	

	var comma = this.addComma(newNum);

	return {
		n:newNum,   //格式化后的原始数字
		f:comma,   //加了逗号的原始数字
		u:numUnit //加了单位的数字
	}				
}

window.onload = function(){
	var a1 = document.getElementById('a1'),
		a2 = document.getElementById('a2'),
		a3 = document.getElementById('a3');
	document.getElementById('unitText').onblur = function(){

		var v = unit({ num:this.value });

		this.value = v.u;
		a1.innerHTML = v.n;
		a2.innerHTML = v.f;
		a3.innerHTML = v.u;
	}
}
