package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"status":"ok","message":"工具箱后端服务运行中"}`)
	})

	addr := ":8080"
	log.Printf("后端服务启动于 %s", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}
