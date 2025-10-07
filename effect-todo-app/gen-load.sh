#!/bin/zsh

for _ in $(seq 1000); do
  xh --ignore-stdin post http://localhost:3000/api/rpc/addTodo json:='{"name": "test"}' &
done


