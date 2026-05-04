
export const fmtDate = (date: Date | string | number, fmt:string = 'yyyy-MM-dd hh:mm:ss') => {
  if (!date) return '';
  if (typeof date === 'string') {
    date = new Date(date);
  } else if (typeof date === 'number') {
    date = new Date(date);
  }
  let fmtStr = ''
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  
  fmtStr = fmt.replace('yyyy', year.toString())
    .replace('MM', month < 10 ? `0${month}` : month.toString())
    .replace('dd', day < 10 ? `0${day}` : day.toString())
    .replace('hh', hour < 10 ? `0${hour}` : hour.toString())
    .replace('mm', minute < 10 ? `0${minute}` : minute.toString())
    .replace('ss', second < 10 ? `0${second}` : second.toString
    ());
  // .replace('SSS', date.getMilliseconds().toString());
  return fmtStr;
}