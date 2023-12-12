# echo server

import uvicorn
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

# query template
class Query(BaseModel):
    text: str

# run server
def serve(host='127.0.0.1', port=8000):
    app = FastAPI()

    origins = [
        'http://localhost:5173',
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.post('/')
    def echo(query: Query):
        words = query.text.split()
        return StreamingResponse(f'{s} ' for s in words)

    uvicorn.run(
        app, host=host, port=port, http='h11', log_level='debug'
    )

if __name__ == '__main__':
    serve()
