"""Reproducible light-theme media for the Liquid Glass demo.

These are procedural illustrations / animation, not third-party photography.
All geometry is derived from the project's previous media generator; no stock
imagery, remote downloads, or Apple wallpaper pixels are involved.
Requires numpy, Pillow and FFmpeg (libx264). Produces local WebP + silent MP4.
"""
from pathlib import Path
import argparse, json, subprocess, time
import numpy as np
from PIL import Image

OUT=Path(__file__).resolve().parents[1]/'public'/'assets'

def rgb(s):
    return np.array([int(s[i:i+2],16) for i in (0,2,4)],np.float32)/255.

def palette(u, stops):
    u=np.clip(u,0,1)
    colors=np.array([rgb(s) for s in stops]); pos=np.linspace(0,1,len(stops))
    return np.stack([np.interp(u,pos,colors[:,i]) for i in range(3)],axis=-1).astype(np.float32)

def coords(w,h):
    return np.meshgrid(np.linspace(-1.6,1.6,w,dtype=np.float32), np.linspace(-1,1,h,dtype=np.float32))

def encode_img(c):
    return np.uint8(np.clip(c,0,1)*255+.5)

def pearl(w,h,t=0,mint=False):
    x,y=coords(w,h); a=2*np.pi*t
    q=x*.64+y*.84+.32*np.sin(x*1.38-y*.48+.16*np.sin(a))
    s=q+.12*np.sin(y*2.1+.20*np.cos(a))+.037*np.sin(x*3.4+y*1.2+a)
    phase=s*4.05+.14*np.sin(a)
    fold=((np.sin(phase)+1)*.5)**1.35
    if mint:
        base=palette((s+2.2)/4.1,['d3e8e8','c4dcdf','e3efdf','edf2dc','d3e5e9','dfe2ef'])
    else:
        base=palette((s+2.0)/4.0,['cbdce9','d7dbf0','ead9eb','f1ddd4','f6e9d6','e8efe7'])
    # Wide, high-key satin surfaces, without the previous black troughs.
    shade=.83+.16*fold
    lip=np.exp(-((np.cos(phase)-.14)/.15)**2)*(np.sin(phase)>0)*.11
    shoulder=np.exp(-((np.cos(phase)+.77)/.26)**2)*.036
    c=base*shade[...,None]+lip[...,None]+shoulder[...,None]
    window=np.exp(-((x+.38)**2/3.6+(y+.63)**2/1.25))*.046
    c+=window[...,None]
    # Neutral airy fill preserves the base colour while leaving smooth relief.
    c=.12*rgb('fbfaf6')+.88*c
    return encode_img(c)

def mist(w,h,t=0):
    x,y=coords(w,h)
    c=palette((y+1)/2,['e0eaf0','f2ece5','f8efe4','e9edeb'])
    glow=np.exp(-((x-.38)**2/1.1+(y+.25)**2/.27))*.045
    c=np.clip(c+glow[...,None]*rgb('fff4e5'),0,1)
    layers=[(-.10,'d5dfe2'),(.10,'c5d4da'),(.31,'b6cbd0'),(.54,'aabfc8'),(.73,'a5b9c3'),(.96,'a1b3bf')]
    for k,(level,col) in enumerate(layers):
        ridge=level+.14*np.sin(x*1.52+k*.83)+.105*np.sin(x*3.0-k*1.31)
        ridge+=.013*np.sin(x*20.1+k*2)+.005*np.cos(x*37.7+k)+.002*np.sin(x*89.3)
        coverage=np.clip((y-ridge)*h/2,0,1)
        depth=np.clip((y-ridge)/.9,0,1)
        fog=np.clip((.24-depth)*1.25,0,.28)
        color=rgb(col)[None,None,:]*(1-depth[...,None]*.012)
        color=color*(1-fog[...,None])+rgb('eff1eb')*fog[...,None]
        c=c*(1-coverage[...,None])+color*coverage[...,None]
    c+=np.random.default_rng(26).normal(0,.0007,(h,w,1)).astype(np.float32)
    return encode_img(c)

def cloud(w,h,t=0):
    x,y=coords(w,h); a=2*np.pi*t
    c=palette((y+1)/2,['cfdfec','dce4ed','ede4e6','f4e7de','efece4'])
    # Soft elongated layers, airy moving cloud folds rather than neon curtains.
    for j in range(4):
        center=-.66+j*.44+.17*np.sin(x*1.55+j*.78+.16*np.sin(a))
        center+=.07*np.sin(x*3.1+j+.24*np.cos(a))
        d=y-center
        wisps=.8+.10*np.sin(x*3.4+j+.13*np.sin(a))
        body=np.exp(-((d+.03)/(.19+j*.006))**2)*wisps
        edge=np.exp(-((d-.155)/.14)**2)
        c=c*(1-(body*.32)[...,None])+rgb('fffaf3')*(body*.32)[...,None]
        c-=edge[...,None]*np.array([.017,.013,.010])
    glow=np.exp(-((x-.9)**2/1.8+(y-.45)**2/1.4))*.024
    c+=glow[...,None]
    return encode_img(c)

SCENES=[('pearl','柔光','01 / PEARL',pearl),('mist','晨雾','02 / MIST',mist),('mint','薄荷','03 / MINT',lambda w,h,t=0:pearl(w,h,t,True)),('cloud','云纱','04 / CLOUD',cloud)]

def build(images_only=False):
    for sub in ('wallpapers','thumbnails','videos','posters'):(OUT/sub).mkdir(parents=True,exist_ok=True)
    catalog=[]
    for name,label,code,fn in SCENES:
        image=Image.fromarray(fn(1920,1200))
        image.save(OUT/'wallpapers'/f'{name}.webp',quality=91,method=6)
        image.resize((240,150),Image.Resampling.LANCZOS).save(OUT/'thumbnails'/f'{name}.webp',quality=84,method=6)
        catalog.append(dict(id=name,label=label,code=code,type='wallpaper',tone='dark',src=f'./assets/wallpapers/{name}.webp',thumb=f'./assets/thumbnails/{name}.webp'))
        print('wallpaper',name,flush=True)
    for name,label,fn,poster_name in [('pearl-motion','柔光流动',pearl,'pearl'),('cloud-motion','云纱慢舞',cloud,'cloud')]:
        if not images_only:
            w,h,fps,seconds=960,600,24,8
            path=OUT/'videos'/f'{name}.mp4'
            p=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{w}x{h}','-r',str(fps),'-i','-','-an','-c:v','libx264','-preset','fast','-threads','2','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(path)],stdin=subprocess.PIPE)
            try:
                for i in range(fps*seconds):p.stdin.write(fn(w,h,i/(fps*seconds)).tobytes())
            finally:p.stdin.close()
            if p.wait()!=0:raise RuntimeError('FFmpeg failed')
            Image.fromarray(fn(960,600)).save(OUT/'posters'/f'{name}.webp',quality=91,method=6)
            print('video',name,path.stat().st_size,flush=True)
        catalog.append(dict(id=name,label=label,code='MOTION / 08 SEC',type='video',tone='dark',src=f'./assets/videos/{name}.mp4',poster=f'./assets/posters/{name}.webp',thumb=f'./assets/thumbnails/{poster_name}.webp'))
    (OUT/'media.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--images-only',action='store_true');args=ap.parse_args();build(args.images_only)
