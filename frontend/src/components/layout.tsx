type LayoutProps = {
    children: React.ReactNode
}


function Layout(props: LayoutProps) {
    const { children } = props
    return (
        <div className='w-full max-w-[1100px] mx-auto md:grid md:grid-cols-6 mt-4 p-2'>
            {children}
        </div>
    )
}

export default Layout