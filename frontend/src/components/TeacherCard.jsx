import React, { useState } from 'react'
import { Card, CardContent, Typography, Box, Button, List, ListItem } from '@mui/material'
import TeacherImage from '../assets/Images/pfp.jpeg'
import { CalendarCheck2, Clock9, Eye, IndianRupee, Mail, Pencil } from 'lucide-react';

const TeacherCard = ({ teacher }) => {
    const {name, email, joining_date, salary, timing, subjects} = teacher;

    const [hover, setHover] = useState(false)

    const details = [
      {text: email, icon: <Mail size={16} />},
      {text: 'Joined '+joining_date, icon: <CalendarCheck2 size={16} />},
      {text: salary, icon: <IndianRupee size={16} />},
      {text: timing, icon: <Clock9 size={16} />}
    ]

    return (
        <Card sx={{
            height: '19 0px',
            width: '32%',
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            borderRadius: '10px',
            boxShadow: '0px 5px 15px 0px rgba(0,0,0,0.3)',
            '&:hover':{
              backgroundColor: 'rgba(77,86,175,0.3)',
              // backgroundColor: '#4d56af',
              transition: '0.5s ease',
              transform: 'translateY(-5px)',
              // color: ' '
            }}}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
          <Box sx={{ display: 'flex', gap: 2}}>
            <Box sx={{
              height: "60px", 
              width: "60px",
              minWidth: "60px", 
              minHeight: "60px", 
              borderRadius: "50%", 
              border: '3px solid white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img 
                src={TeacherImage} 
                alt="Teacher's Image"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
                <Typography sx={{fontWeight: 'bold', fontSize: '18px', color: hover ? '#1a237e' : 'black'}}>{name}</Typography>
                <Box sx={{ display: 'flex', gap: 1}}>
                  <Eye size={21} cursor={'pointer'}/>
                  <Pencil size={18} cursor={'pointer'} />
                </Box>
              </Box>
              <List>
                {details.map((detail, index) => (
                  <ListItem key={index} sx={{
                    fontSize: '14px', 
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '& svg': {
                      flexShrink: 0
                    }
                  }}>
                    {detail.icon} {detail.text}
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
          <Box>
            <List sx={{display: 'flex',fontSize: '10px', padding: 0, gap: 2}}>
              {subjects.map((subject, index) => (
                <Box sx={{border: '1px solid grey', borderRadius: '20px', padding: '3px', backgroundColor: hover ? 'white' : 'rgba(77,86,175,0.3)', color: hover ? '#1a237e' : 'black', }}>
                  <ListItem key={index} sx={{fontSize: '12px', padding: 0}}>
                    {subject}
                  </ListItem>
                </Box>
              ))}
            </List>
          </Box>
        </Card>
        
    )
}

export default TeacherCard