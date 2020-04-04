var arr = [-1, 1, 3, 4, 6, 10 ]

arr.sort((a,b)=>{return Math.abs(a-3) - Math.abs( b- 3)})

console.log(arr)
