//
//  OscUtils.cpp
//  Hydrogen_OscOsxReceiver
//
//  Created by Rick Boykin on 11/28/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#include "OscUtils.h"
#include "OscHostEndianness.h"

namespace osc
{
    // return the first 4 byte boundary after the end of a str4
    // be careful about calling this version if you don't know whether
    // the string is terminated correctly.
    const char* FindStr4End( const char *p )
    {
        if( p[0] == '\0' )    // special case for SuperCollider integer address pattern
            return p + 4;
        
        p += 3;
        
        while( *p )
            p += 4;
        
        return p + 1;
    }
    
    // return the first 4 byte boundary after the end of a str4
    // returns 0 if p == end or if the string is unterminated
    const char* FindStr4End( const char *p, const char *end )
    {
        if( p >= end )
            return 0;
        
        if( p[0] == '\0' )    // special case for SuperCollider integer address pattern
            return p + 4;
        
        p += 3;
        end -= 1;
        
        while( p < end && *p )
            p += 4;
        
        if( *p )
            return 0;
        else
            return p + 1;
    }
    
    int32 ToInt32( const char *p )
    {
#ifdef OSC_HOST_LITTLE_ENDIAN
        union{
            osc::int32 i;
            char c[4];
        } u;
        
        u.c[0] = p[3];
        u.c[1] = p[2];
        u.c[2] = p[1];
        u.c[3] = p[0];
        
        return u.i;
#else
        return *(int32*)p;
#endif
    }
    
    uint32 ToUInt32( const char *p )
    {
#ifdef OSC_HOST_LITTLE_ENDIAN
        union{
            osc::uint32 i;
            char c[4];
        } u;
        
        u.c[0] = p[3];
        u.c[1] = p[2];
        u.c[2] = p[1];
        u.c[3] = p[0];
        
        return u.i;
#else
        return *(uint32*)p;
#endif
    }
    
    
    int64 ToInt64( const char *p )
    {
#ifdef OSC_HOST_LITTLE_ENDIAN
        union{
            osc::int64 i;
            char c[8];
        } u;
        
        u.c[0] = p[7];
        u.c[1] = p[6];
        u.c[2] = p[5];
        u.c[3] = p[4];
        u.c[4] = p[3];
        u.c[5] = p[2];
        u.c[6] = p[1];
        u.c[7] = p[0];
        
        return u.i;
#else
        return *(int64*)p;
#endif
    }
    
    
    uint64 ToUInt64( const char *p )
    {
#ifdef OSC_HOST_LITTLE_ENDIAN
        union{
            osc::uint64 i;
            char c[8];
        } u;
        
        u.c[0] = p[7];
        u.c[1] = p[6];
        u.c[2] = p[5];
        u.c[3] = p[4];
        u.c[4] = p[3];
        u.c[5] = p[2];
        u.c[6] = p[1];
        u.c[7] = p[0];
        
        return u.i;
#else
        return *(uint64*)p;
#endif
    }
    
    void FromInt32( char *p, int32 x )
    {
#ifdef OSC_HOST_LITTLE_ENDIAN
        union{
            osc::int32 i;
            char c[4];
        } u;
        
        u.i = x;
        
        p[3] = u.c[0];
        p[2] = u.c[1];
        p[1] = u.c[2];
        p[0] = u.c[3];
#else
        *reinterpret_cast<int32*>(p) = x;
#endif
    }
    
    
    void FromUInt32( char *p, uint32 x )
    {
#ifdef OSC_HOST_LITTLE_ENDIAN
        union{
            osc::uint32 i;
            char c[4];
        } u;
        
        u.i = x;
        
        p[3] = u.c[0];
        p[2] = u.c[1];
        p[1] = u.c[2];
        p[0] = u.c[3];
#else
        *reinterpret_cast<uint32*>(p) = x;
#endif
    }
    
    
    void FromInt64( char *p, int64 x )
    {
#ifdef OSC_HOST_LITTLE_ENDIAN
        union{
            osc::int64 i;
            char c[8];
        } u;
        
        u.i = x;
        
        p[7] = u.c[0];
        p[6] = u.c[1];
        p[5] = u.c[2];
        p[4] = u.c[3];
        p[3] = u.c[4];
        p[2] = u.c[5];
        p[1] = u.c[6];
        p[0] = u.c[7];
#else
        *reinterpret_cast<int64*>(p) = x;
#endif
    }
    
    
    void FromUInt64( char *p, uint64 x )
    {
#ifdef OSC_HOST_LITTLE_ENDIAN
        union{
            osc::uint64 i;
            char c[8];
        } u;
        
        u.i = x;
        
        p[7] = u.c[0];
        p[6] = u.c[1];
        p[5] = u.c[2];
        p[4] = u.c[3];
        p[3] = u.c[4];
        p[2] = u.c[5];
        p[1] = u.c[6];
        p[0] = u.c[7];
#else
        *reinterpret_cast<uint64*>(p) = x;
#endif
    }
    
} // namespace osc
