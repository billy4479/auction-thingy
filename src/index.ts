const input = document.getElementById('input') as HTMLTextAreaElement;
const tbody = document.getElementsByTagName('tbody')[0];
const thead = document.getElementsByTagName('thead')[0];
const h2 = document.getElementsByTagName('h2')[0];
const outContainer = document.getElementById(
  'output-container'
) as HTMLDivElement;
const total = document.getElementById('total') as HTMLDivElement;

outContainer.hidden = true;

const enum Method {
  EMT,
  Other,
}

class Line {
  name = '';
  items: number[] = [];
  amount = 0;
  method: Method = Method.Other;
  other = '';
}

function parseLine(line: string): Line | null {
  const enum State {
    Name,
    Items,
    Amount,
  }

  const result = new Line();
  if (line.trim().length === 0) return null;

  let state = State.Name;
  let currentNum = '';
  let other = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    let rerun = false;

    do {
      rerun = false;
      switch (state) {
        case State.Name:
          if (char.match(/[a-zA-Z]|\ /)) result.name += char;
          else {
            state = State.Items;
            rerun = true;
          }

          break;
        case State.Items:
          if (char === '$') {
            state = State.Amount;
            rerun = true;
            break;
          }

          if (char.match(/[0-9]/)) currentNum += char;
          else if (currentNum.length !== 0) {
            result.items.push(parseInt(currentNum));
            currentNum = '';
          }

          break;

        case State.Amount:
          if (char.match(/[0-9]/)) currentNum += char;
          else if (char === '✅') {
            result.amount = parseInt(currentNum);
            result.method = Method.EMT;
            other = line.substring(i + 1);
            i = line.length; // End the loop
          }
      }
    } while (rerun);
  }

  if (result.amount === 0) result.amount = parseInt(currentNum);
  result.other = other;
  result.items.sort();

  return result;
}

function getHtml(lines: Line[]): string {
  let result = '';

  lines.forEach((line, index) => {
    const getItems = (items: number[]): string => {
      let r = '';
      items.forEach((v, i) => {
        r += '#' + v;
        if (i !== items.length - 1) r += ', ';
      });
      return r;
    };

    result += `
    <tr>
      <td>${index + 1}</td>
      <td>${line.name}</td>
      <td>${getItems(line.items)}</td>
      <td>$${line.amount}</td>
      <td>${line.method === Method.Other ? '' : 'ETRANSFER'}</td>
      <td>${line.other}</td>
    </tr>
    `;
  });

  return result;
}

input.onkeyup = () => {
  const data: Line[] = [];
  let t = 0;
  input.value.split('\n').forEach((line) => {
    const result = parseLine(line);
    if (result !== null) {
      data.push(result);
      t += result.amount;
    }
  });

  outContainer.hidden = false;
  tbody.innerHTML = getHtml(data);
  thead.innerHTML = `
  <tr>
    <th>#</th>
    <th>NAME</th>
    <th>ITEMS</th>
    <th>TOTAL</th>
    <th>METHOD</th>
    <th>OTHER</th>
  </tr>
  `;

  h2.innerText = 'Result';
  total.innerText = `Total: $${t}`;
};
