'use client';
import {useMemo} from 'react';
export default function YearSelector({year,onChange}:{year:number,onChange:(y:number)=>void}){
 const years=useMemo(()=>{const now=new Date().getFullYear(); return Array.from({length:8},(_,i)=>now-i)},[]);
 return <label style={{display:'flex',alignItems:'center',gap:8,fontWeight:700}}>Year:<select className="input" style={{width:130}} value={year} onChange={e=>onChange(Number(e.target.value))}>{years.map(y=><option key={y} value={y}>{y}{y===new Date().getFullYear()?' (Current)':''}</option>)}</select></label>
}
