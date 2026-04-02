fetch('https://tea-withering-system-4d483-default-rtdb.firebaseio.com/readings.json?orderBy=%22%24key%22&limitToLast=5').then(r=>r.text()).then(t=>console.log(t))
