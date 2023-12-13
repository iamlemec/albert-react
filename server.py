# streaming llm server

import os
import json

from pydantic import BaseModel

from itertools import chain, accumulate

# get this directory
module_dir = os.path.dirname(os.path.realpath(__file__))
static_dir = os.path.relpath(os.path.join(module_dir, 'src'))

# query template
class Query(BaseModel):
    prompt: str

class Simil(BaseModel):
    prompt: str

# cumulative sum
def cumsum(lengths):
    return list(chain([0], accumulate(lengths)))

# get cumulative indices
def cumul_indices(lengths):
    sums = cumsum(lengths)
    return [(i, j) for i, j in zip(sums[:-1], sums[1:])]

def uniform_scale(vals):
    min_val, max_val = vals.min(), vals.max()
    return (vals - min_val) / (max_val - min_val)

# break up a list into cumulative indices
def split_list(vals, sizes):
    return [vals[i:j] for i, j in cumul_indices(sizes)]

# buffer stream so we can yield batches
def buffer_stream(stream, min_size):
    buf = []
    for item in stream:
        buf.append(item)
        if len(buf) >= min_size:
            yield buf
            buf = []
    if len(buf) > 0:
        yield buf

# generate response from llm
def gen_response(model, prompt, buffer_size, **kwargs):
    stream = model.generate(prompt, **kwargs)
    buffer = buffer_stream(stream, buffer_size)
    try:
        for batch in buffer:
            text = ''.join(batch)
            print(text, end='', flush=True)
            yield text.encode('utf-8')
    except Exception as e:
        yield f'ERROR: {e}'.encode('utf-8')

# run server
def serve(model, host='127.0.0.1', port=8000, buffer_size=1, **kwargs):
    import uvicorn
    from fastapi import FastAPI
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse, StreamingResponse
    from fastapi.middleware.cors import CORSMiddleware

    # create api
    app = FastAPI()

    # add in CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=['http://localhost:5173'],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # mount static directory
    app.mount('/static', StaticFiles(directory=static_dir), name='static')

    @app.get('/')
    def index():
        index_path = os.path.join(static_dir, 'html/index.html')
        return FileResponse(index_path)

    @app.get('/embed')
    def embed():
        embed_path = os.path.join(static_dir, 'html/embed.html')
        return FileResponse(embed_path)

    @app.get('/chunks')
    def chunks():
        return list(model.data.chunks.items())

    @app.post('/simil')
    def simil(request: Simil):
        prompt = request.prompt
        vecs = model.embed.embed(prompt)
        sims = model.data.cindex.simil(vecs)
        sims = uniform_scale(sims)
        sizes = [len(v) for v in model.data.chunks.values()]
        dsims = split_list(sims.tolist(), sizes)
        return dict(zip(model.data.chunks, dsims))

    @app.post('/query')
    def run_query(request: Query):
        prompt = request.prompt
        print(f'\n\nQUERY: {prompt}\nRESPONSE: ', sep='', flush=True)
        return StreamingResponse(
            gen_response(model, prompt, buffer_size, **kwargs), media_type='text/event-stream'
        )

    uvicorn.run(
        app, host=host, port=port, http='h11', log_level='debug'
    )
