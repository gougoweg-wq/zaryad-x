
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[R(0,a.length-1)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=R(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const NAMES=['Ноа','Ари','Дани','Рони','Тали','Лиа'];
const two=()=>{const a=pick(NAMES);let b=pick(NAMES);while(b===a)b=pick(NAMES);return[a,b]};
const raz=k=>k<=4?'раза':'раз';
const pl=(n,a,b,c)=>{const m=n%100,d=n%10;return n+' '+(m>10&&m<20?c:d===1?a:d>=2&&d<=4?b:c)};
const dec=n=>String(n).replace('.',',');
const CASES={
sum3(){const n=R(11,40),S=3*n+3;return{kind:'Числа подряд',text:`Три числа идут подряд, их сумма равна ${S}.`,letX:'первое число',root:n,frame:'▢ + ▢ + ▢ = ▢',phr:[['первое число','x'],['следующее за ним','x + 1'],['третье число','x + 2'],['их сумма',''+S]],traps:['2x','x + 3','3x','x − 1']}},
more(){const[A,B]=two(),a=R(12,40),d=R(3,15),S=2*a+d;return{kind:'На больше',text:`У ${A} и ${B} вместе ${pl(S,'монета','монеты','монет')}. У ${B} на ${pl(d,'монету','монеты','монет')} больше, чем у ${A}.`,letX:`монеты ${A}`,root:a,frame:'▢ + ▢ = ▢',phr:[[`монеты ${A}`,'x'],[`у ${B} на ${d} больше`,`x + ${d}`],['вместе',''+S]],traps:[`${d}x`,`x − ${d}`,`${S} + x`,`${d}`]}},
times(){const[A,B]=two(),a=R(6,20),k=R(3,6),S=a*(k+1);return{kind:'Во сколько раз',text:`У ${A} и ${B} вместе ${pl(S,'наклейка','наклейки','наклеек')}. У ${A} в ${k} ${raz(k)} больше, чем у ${B}.`,letX:`наклейки ${B}`,root:a,frame:'▢ + ▢ = ▢',phr:[[`наклейки ${B}`,'x'],[`у ${A} в ${k} ${raz(k)} больше`,`${k}x`],['вместе',''+S]],traps:[`x + ${k}`,`x/${k}`,`${S}x`,`${k}`]}},
rect(){const w=R(4,20),d=R(2,9),P=2*(2*w+d);return{kind:'Периметр',text:`Длина прямоугольника на ${d} см больше ширины. Периметр равен ${P} см.`,letX:'ширина',root:w,frame:'2(▢ + ▢) = ▢',phr:[['ширина','x'],[`длина на ${d} больше`,`x + ${d}`],['периметр',''+P]],traps:[`${d}x`,`x − ${d}`,`2x`,`${P}x`]}},
price(){const p=pick([10,20,25,50]),o=20*R(5,30),P=o*(100+p)/100,q=dec(p/100);return{kind:'Проценты: рост',text:`Кроссовки подорожали на ${p}% и теперь стоят ${P} ₪.`,letX:'старая цена',root:o,frame:'▢ + ▢ = ▢',phr:[['старая цена','x'],[`прибавка ${p}%`,`${q}x`],['новая цена',''+P]],traps:[`${p}x`,`x + ${p}`,`x/${p}`,`${q}`]}},
sale(){const p=pick([10,20,25,50]),o=20*R(5,30),P=o*(100-p)/100,q=dec(p/100);return{kind:'Проценты: скидка',text:`На куртку скидка ${p}%. Со скидкой она стоит ${P} ₪.`,letX:'цена без скидки',root:o,frame:'▢ − ▢ = ▢',phr:[['цена без скидки','x'],[`скидка ${p}%`,`${q}x`],['цена со скидкой',''+P]],traps:[`${p}x`,`x − ${p}`,`x/${p}`,`${q}`]}},
give(){const[A,B]=two(),g=R(6,25);return{kind:'Было и стало',text:`У ${A} в 3 раза больше карточек, чем у ${B}. Если ${A} передаст ${B} ${pl(g,'карточку','карточки','карточек')}, у них станет поровну.`,letX:`карточки ${B} сейчас`,root:g,frame:'▢ = ▢',phr:[[`у ${A} станет`,`3x − ${g}`],[`у ${B} станет`,`x + ${g}`]],traps:[`3x + ${g}`,`x − ${g}`,`3(x − ${g})`,`${g}x`]}},
speed(){const a=R(2,3),b=R(2,4),v=R(30,70),d=10*R(1,2),S=a*v+b*(v+d);return{kind:'Движение',text:`Поезд ехал ${a} ч с одной скоростью, потом ${b} ч на ${d} км/ч быстрее. Всего он проехал ${S} км.`,letX:'скорость сначала',root:v,frame:'▢ + ▢ = ▢',phr:[['путь сначала',`${a}x`],['путь потом',`${b}(x + ${d})`],['весь путь',''+S]],traps:[`${b}x + ${d}`,`x + ${a}`,`${a}(x + ${d})`,`${b}(x − ${d})`]}},
age(){const b=R(7,12),t=R(3,8),a=3*b+2*t;return{kind:'Возраст',text:`Папе ${pl(a,'год','года','лет')}, сыну ${b}. Через сколько лет папа будет старше сына ровно в 3 раза?`,letX:'сколько лет пройдёт',root:t,frame:'▢ = 3(▢)',phr:[['папа через x лет',`${a} + x`],['сын через x лет',`${b} + x`]],traps:[`${a}x`,`${b}x`,`${a} − x`,`${b} − x`]}},
book(){const m=R(2,12),N=7*m;return{kind:'Дроби',text:`В первый день прочитали треть книги, во второй — четверть. Всего прочитано ${pl(N,'страница','страницы','страниц')}.`,letX:'страницы всей книги',root:12*m,frame:'▢ + ▢ = ▢',phr:[['треть книги','x/3'],['четверть книги','x/4'],['прочитано',''+N]],traps:['3x','4x','x − 3','x + 4']}},
money(){const m=R(12,30),s=R(5,15),r=2*m-s;return{kind:'Было и осталось',text:`Тали потратила треть денег на книгу и ещё ${s} ₪ на сок. Осталось ${r} ₪.`,letX:'деньги сначала',root:3*m,frame:'▢ − ▢ − ▢ = ▢',phr:[['деньги сначала','x'],['на книгу','x/3'],['на сок',''+s],['осталось',''+r]],traps:['3x',`${s}x`,`x + ${s}`,'x − 3']}},
tickets(){const a=R(2,5),b=R(2,4),d=5*R(1,3),p=5*R(6,14),T=a*p+b*(p-d);return{kind:'Покупка',text:`Купили ${a} взрослых и ${b} детских билетов на ${T} ₪. Детский на ${d} ₪ дешевле взрослого.`,letX:'цена взрослого билета',root:p,frame:'▢ + ▢ = ▢',phr:[['взрослые билеты',`${a}x`],['детские билеты',`${b}(x − ${d})`],['вся покупка',''+T]],traps:[`${b}x − ${d}`,`${b}(x + ${d})`,`${a}(x − ${d})`,`${b}x`]}}
};
const FRAMES={2:['▢ = ▢','▢ + ▢ = 0','▢ = 2(▢)','▢ = 3(▢)','3(▢) = ▢'],3:['▢ + ▢ = ▢','▢ − ▢ = ▢','▢ = ▢ + ▢','▢ · ▢ = ▢','2(▢ + ▢) = ▢'],4:['▢ + ▢ + ▢ = ▢','▢ − ▢ − ▢ = ▢','▢ + ▢ − ▢ = ▢','▢ − ▢ + ▢ = ▢']};
const slots=f=>(f.match(/▢/g)||[]).length;
const fill=(f,ts)=>{let i=0;return f.replace(/▢/g,()=>{const t=ts[i++];return t==null?'▢':t})};
function compile(s){s=s.replace(/−/g,'-').replace(/·/g,'*').replace(/,/g,'.').replace(/\s/g,'');let i=0;
 const expr=()=>{let f=term();while(s[i]==='+'||s[i]==='-'){const o=s[i++],a=f,b=term();f=o==='+'?x=>a(x)+b(x):x=>a(x)-b(x)}return f};
 const term=()=>{let f=fac();for(;;){const c=s[i];if(c==='*'||c==='/'){i++;const a=f,b=fac();f=c==='*'?x=>a(x)*b(x):x=>a(x)/b(x)}else if(c==='x'||c==='('){const a=f,b=fac();f=x=>a(x)*b(x)}else return f}};
 const fac=()=>{if(s[i]==='x'){i++;return x=>x}if(s[i]==='('){i++;const f=expr();i++;return f}const m=s.slice(i).match(/^\d+(\.\d+)?/);i+=m[0].length;const v=+m[0];return()=>v};
 return expr()}
const sides=eq=>eq.split('=').map(compile);
const rootOf=eq=>{const[L,Rr]=sides(eq),d=x=>L(x)-Rr(x),y0=d(1),y1=d(2),y2=d(3);if(Math.abs(y2-2*y1+y0)>1e-9)return NaN;const a=y1-y0;return Math.abs(a)<1e-9?NaN:-(y0-a)/a};

const pieces=f=>f.match(/▢|[^▢\s]+/g);
export function makeRound(pool){const c=CASES[pick(pool)]();let i=0;const need=pieces(c.frame).map(p=>p==='▢'?c.phr[i++][1]:p);
 const extra=shuffle(c.traps.filter(t=>!need.includes(t))).slice(0,2);return{...c,need,extra,eq:need.join(' ')}}
export function check(seq,r){if([...seq].sort().join('|')!==[...r.need].sort().join('|'))return false;const e=seq.join(' ');if((e.match(/=/g)||[]).length!==1)return false;try{return Math.abs(rootOf(e)-r.root)<1e-6}catch(_){return false}}
export function decoys(root){const s=root>=100&&root%20===0?20:1;const o=new Set();while(o.size<2){const v=root+s*R(-6,6);if(v>0&&v!==root)o.add(v)}return shuffle([root,...o])}
export{shuffle,pick,R,CASES,rootOf};
