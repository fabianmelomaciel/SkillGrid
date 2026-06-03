function greet(name: string): string {
  const  x: number = "hello"; // lint: double space
  // type error: cannot assign string to number
  return x;
}
