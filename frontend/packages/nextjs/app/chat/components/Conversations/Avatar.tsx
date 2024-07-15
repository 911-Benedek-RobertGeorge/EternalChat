


export function Avatar({avatar}: {avatar: string }) {
    return (<div className="avatar">
        <div className="mask mask-squircle h-12 w-12">
            <img
                src={avatar}
                alt="Avatar Tailwind CSS Component" />
        </div>
    </div>)
}