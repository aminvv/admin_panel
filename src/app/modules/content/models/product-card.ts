export interface BlogCard {
id?: number
title: string
description: string
content: string
slug: string
category: string
image?: string[]
create_at?: string 
update_at?: string
comments?: Comment[]

}

